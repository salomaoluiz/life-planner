import {
  autoMatch,
  distinctValues,
  isSystemCategoryName,
  matchPaid,
  matchType,
} from "@application/csvImport/distinctValues";
import { columnsOf } from "@application/csvImport/mapping";
import {
  ColumnMapping,
  ColumnTarget,
  ValueMaps,
} from "@application/csvImport/types";

// Spec 047 FR 22: one tab per mapped column that points to records or to a fixed set of answers.
export type ValueTab = "account" | "card" | "category" | "paid" | "type";

export const VALUE_TABS: ValueTab[] = [
  "category",
  "account",
  "card",
  "type",
  "paid",
];

const TAB_TARGET: Record<ValueTab, ColumnTarget> = {
  account: "account",
  card: "card",
  category: "category",
  paid: "paid",
  type: "type",
};

// The records of the chosen owner the values can be matched to (active ones, system categories excluded).
export interface ImportRecords {
  accounts: { id: string; name: string }[];
  cards: { id: string; name: string }[];
  categories: { id: string; name: string; path: string }[];
}

// What the user chose: tab → file value → record id (or answer).
export type ValueChoices = Partial<Record<ValueTab, Record<string, string>>>;

export interface ValueEntry {
  // Matched by name by the app (FR 24), not chosen by the user.
  auto: boolean;
  // Number of rows that use the value.
  rows: number;
  // A record id, `INCOME`/`EXPENSE`, or `true`/`false`/`default` for Paid; undefined while unmatched.
  selected?: string;
  value: string;
}

function autoSelection(
  tab: ValueTab,
  value: string,
  records: ImportRecords,
): string | undefined {
  if (tab === "category") {
    return autoMatch(
      value,
      records.categories.map((item) => ({
        id: item.id,
        names: [item.name, item.path],
      })),
    );
  }

  if (tab === "account" || tab === "card") {
    const list = tab === "account" ? records.accounts : records.cards;

    return autoMatch(
      value,
      list.map((item) => ({ id: item.id, names: [item.name] })),
    );
  }

  if (tab === "type") {
    return matchType(value);
  }

  const paid = matchPaid(value);

  return paid === undefined ? undefined : String(paid);
}

// The tabs a mapping needs, in tab order.
function tabsOf(mapping: ColumnMapping): ValueTab[] {
  return VALUE_TABS.filter(
    (tab) => columnsOf(mapping, TAB_TARGET[tab]).length > 0,
  );
}

// The maps `buildRows` reads (FR 23): a value without a selection has no entry.
function toValueMaps(
  entriesByTab: Partial<Record<ValueTab, ValueEntry[]>>,
): ValueMaps {
  const maps: ValueMaps = {
    account: {},
    card: {},
    category: {},
    paid: {},
    type: {},
  };

  for (const tab of VALUE_TABS) {
    for (const entry of entriesByTab[tab] ?? []) {
      if (entry.selected === undefined) {
        continue;
      }

      if (tab === "type") {
        maps.type[entry.value] = entry.selected as "EXPENSE" | "INCOME";
      } else if (tab === "paid") {
        maps.paid[entry.value] =
          entry.selected === "default" ? "default" : entry.selected === "true";
      } else {
        maps[tab][entry.value] = entry.selected;
      }
    }
  }

  return maps;
}

function unmatchedCount(entries: ValueEntry[]): number {
  return entries.filter((entry) => entry.selected === undefined).length;
}

// FR 22-24: the distinct values of the column with the app match (or the user's choice).
function valueEntries(
  tab: ValueTab,
  rows: string[][],
  mapping: ColumnMapping,
  records: ImportRecords,
  choices: ValueChoices,
): ValueEntry[] {
  const [column] = columnsOf(mapping, TAB_TARGET[tab]);

  if (column === undefined) {
    return [];
  }

  return distinctValues(rows, column)
    .filter((item) => tab !== "category" || !isSystemCategoryName(item.value))
    .map((item) => {
      const auto = autoSelection(tab, item.value, records);
      const chosen = choices[tab]?.[item.value];

      return {
        auto: chosen === undefined && auto !== undefined,
        rows: item.rows,
        selected: chosen ?? auto,
        value: item.value,
      };
    });
}

export { tabsOf, toValueMaps, unmatchedCount, valueEntries };
