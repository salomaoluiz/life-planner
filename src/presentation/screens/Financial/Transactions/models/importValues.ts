import {
  autoMatch,
  distinctValues,
  isSystemCategoryName,
  matchPaid,
  matchType,
} from "@application/csvImport/distinctValues";
import { columnsOf } from "@application/csvImport/mapping";
import { parseAmountCents } from "@application/csvImport/parseValues";
import {
  ColumnMapping,
  ColumnTarget,
  DecimalSeparator,
  FixedValues,
  RowType,
  ValueMaps,
} from "@application/csvImport/types";
import { CurrencyCode } from "@domain/entities/financial/Currency";

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

// What the category entries need to know the type of each row.
export interface EntryContext {
  decimal: DecimalSeparator;
  fixed: FixedValues;
  // The matched answers of the Type column.
  typeMap: Record<string, RowType>;
}

// The records of the chosen owner the values can be matched to (active ones, system categories excluded).
export interface ImportRecords {
  accounts: { currency: CurrencyCode; id: string; name: string }[];
  cards: {
    closingDay?: number;
    currency: CurrencyCode;
    id: string;
    name: string;
  }[];
  categories: {
    depthLevel: number;
    id: string;
    name: string;
    path: string;
    type: "EXPENSE" | "INCOME";
  }[];
}

// What the user chose: tab → file value → record id (or answer).
export type ValueChoices = Partial<Record<ValueTab, Record<string, string>>>;

export interface ValueEntry {
  // Matched by name by the app (FR 24), not chosen by the user.
  auto: boolean;
  // Where the choice is kept and what the row builder looks up: the value, except for categories, which are matched per
  // type (`EXPENSE|Transferências`): income and expense can have a category with the same name.
  key: string;
  // Number of rows that use the value.
  rows: number;
  // A record id, `INCOME`/`EXPENSE`, or `true`/`false`/`default` for Paid; undefined while unmatched.
  selected?: string;
  // Categories only: the type of the rows that use the value.
  type?: RowType;
  value: string;
}

// The key of a category value of a type (matches `buildRows`).
export function categoryKey(type: RowType | undefined, value: string): string {
  return `${type ?? ""}|${value}`;
}

export function typeOfRow(
  row: string[],
  mapping: ColumnMapping,
  decimal: DecimalSeparator,
  maps: { fixed: FixedValues; valueMaps: ValueMaps },
): RowType | undefined {
  function cell(target: ColumnTarget): string {
    const [column] = columnsOf(mapping, target);

    return column === undefined ? "" : (row[column] ?? "").trim();
  }

  if (columnsOf(mapping, "signedAmount").length > 0) {
    const parsed = parseAmountCents(cell("signedAmount"), decimal);

    if (!parsed) {
      return undefined;
    }

    return parsed.negative ? "EXPENSE" : "INCOME";
  }

  if (columnsOf(mapping, "incomeAmount").length > 0) {
    const income = parseAmountCents(cell("incomeAmount"), decimal);
    const expense = parseAmountCents(cell("expenseAmount"), decimal);

    if (Boolean(income) === Boolean(expense)) {
      return undefined;
    }

    return income ? "INCOME" : "EXPENSE";
  }

  const text = cell("type");

  return text === ""
    ? maps.fixed.type
    : (maps.valueMaps.type[text] ?? maps.fixed.type);
}

function autoSelection(
  tab: ValueTab,
  value: string,
  records: ImportRecords,
  type?: RowType,
): string | undefined {
  if (tab === "category") {
    return autoMatch(
      value,
      records.categories
        .filter((item) => type === undefined || item.type === type)
        .map((item) => ({
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

function categoryEntries(
  column: number,
  rows: string[][],
  mapping: ColumnMapping,
  records: ImportRecords,
  choices: ValueChoices,
  context: EntryContext,
): ValueEntry[] {
  const counts = new Map<string, ValueEntry>();

  for (const row of rows) {
    const value = (row[column] ?? "").trim();

    if (value === "" || isSystemCategoryName(value)) {
      continue;
    }

    const type = typeOfRow(row, mapping, context.decimal, {
      fixed: context.fixed,
      valueMaps: { ...EMPTY_MAPS, type: context.typeMap },
    });
    const key = categoryKey(type, value);
    const known = counts.get(key);

    if (known) {
      known.rows += 1;
      continue;
    }

    const auto = autoSelection("category", value, records, type);
    const chosen = choices.category?.[key];

    counts.set(key, {
      auto: chosen === undefined && auto !== undefined,
      key,
      rows: 1,
      selected: chosen ?? auto,
      type,
      value,
    });
  }

  return [...counts.values()];
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
        maps[tab][entry.key] = entry.selected;
      }
    }
  }

  return maps;
}

function unmatchedCount(entries: ValueEntry[]): number {
  return entries.filter((entry) => entry.selected === undefined).length;
}

// FR 22-24: the distinct values of the column with the app match (or the user's choice). Categories are listed once per
// type of the rows that use them and matched only to categories of that type.
function valueEntries(
  tab: ValueTab,
  rows: string[][],
  mapping: ColumnMapping,
  records: ImportRecords,
  choices: ValueChoices,
  context?: EntryContext,
): ValueEntry[] {
  const [column] = columnsOf(mapping, TAB_TARGET[tab]);

  if (column === undefined) {
    return [];
  }

  if (tab === "category" && context) {
    return categoryEntries(column, rows, mapping, records, choices, context);
  }

  return distinctValues(rows, column)
    .filter((item) => tab !== "category" || !isSystemCategoryName(item.value))
    .map((item) => {
      const auto = autoSelection(tab, item.value, records);
      const chosen = choices[tab]?.[item.value];

      return {
        auto: chosen === undefined && auto !== undefined,
        key: item.value,
        rows: item.rows,
        selected: chosen ?? auto,
        value: item.value,
      };
    });
}

const EMPTY_MAPS: ValueMaps = {
  account: {},
  card: {},
  category: {},
  paid: {},
  type: {},
};

export { tabsOf, toValueMaps, unmatchedCount, valueEntries };
