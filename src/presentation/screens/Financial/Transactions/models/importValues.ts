import {
  CARD_CREDIT_CATEGORIES,
  matchCreditCategory,
} from "@application/csvImport/cardCredits";
import {
  autoMatch,
  distinctValues,
  isSystemCategoryName,
  matchPaid,
  matchType,
} from "@application/csvImport/distinctValues";
import { columnsOf } from "@application/csvImport/mapping";
import {
  accountKey,
  categoryKey,
  ownerOfRow,
} from "@application/csvImport/owner";
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
export type ValueTab =
  | "account"
  | "card"
  | "category"
  | "owner"
  | "paid"
  | "type";

export const VALUE_TABS: ValueTab[] = [
  "owner",
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
  owner: "owner",
  paid: "paid",
  type: "type",
};

// The records of an owner the values can be matched to (active ones, system categories excluded).
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
    // "ALL" for a category of Personal and every family (spec 038).
    scope?: string;
    type: "EXPENSE" | "INCOME";
  }[];
}

export const NO_RECORDS: ImportRecords = {
  accounts: [],
  cards: [],
  categories: [],
};

// Spec 047: accounts, cards and categories are matched in the owner of each row (a family and Personal can have an
// account of the same name), so the records come per owner.
export interface EntryContext {
  catalog: Record<string, ImportRecords>;
  decimal: DecimalSeparator;
  // The owner of the rows without a "Belongs to" value.
  defaultOwnerId: string;
  fixed: FixedValues;
  // The matched answers of the "Belongs to" column (file value → owner id).
  ownerMap: Record<string, string>;
  // What the "Belongs to" values can be matched to: the owners and the names they go by in a file.
  owners: { id: string; names: string[] }[];
  // The matched answers of the Type column.
  typeMap: Record<string, RowType>;
}

// What the user chose: tab → entry key → record id (or answer).
export type ValueChoices = Partial<Record<ValueTab, Record<string, string>>>;

export interface ValueEntry {
  // Matched by name by the app (FR 24), not chosen by the user.
  auto: boolean;
  // Categories only (spec 048): how many of the rows are card rows, the only ones the card credit categories fit.
  cardRows?: number;
  // Where the choice is kept and what the row builder looks up (see `ValueMaps`): the value for owner, type and paid;
  // `<ownerId>|<value>` for accounts and cards; `<ownerId>|<type>|<value>` for categories.
  key: string;
  // The owner the value is matched in (accounts, cards and categories).
  ownerId?: string;
  // Number of rows that use the value.
  rows: number;
  // A record id, an owner id, `INCOME`/`EXPENSE`, or `true`/`false`/`default` for Paid; undefined while unmatched.
  selected?: string;
  // Categories only: the type of the rows that use the value.
  type?: RowType;
  value: string;
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
  cardRows = 0,
): string | undefined {
  if (tab === "category") {
    return (
      autoMatch(
        value,
        records.categories
          .filter((item) => type === undefined || item.type === type)
          .map((item) => ({ id: item.id, names: [item.name, item.path] })),
      ) ??
      // Spec 048 FR 11: a value of card rows can name a card credit category.
      (type !== undefined && cardRows > 0
        ? matchCreditCategory(value, type)
        : undefined)
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

// A row is a card row when its card cell is filled, or when it has no account and the card is fixed (spec 048).
function isCardRow(
  row: string[],
  mapping: ColumnMapping,
  fixed: FixedValues,
): boolean {
  function filled(target: ColumnTarget) {
    return columnsOf(mapping, target).some(
      (column) => (row[column] ?? "").trim() !== "",
    );
  }

  if (filled("card")) {
    return true;
  }

  return !filled("account") && fixed.accountOrCard?.kind === "card";
}

// Spec 048 FR 12: the rows of a value mapped to a card credit category that can't use it (not card rows).
function misusedRows(entry: ValueEntry): number {
  const credit = CARD_CREDIT_CATEGORIES.some(
    (item) => item.id === entry.selected,
  );

  return credit ? entry.rows - (entry.cardRows ?? 0) : 0;
}

const EMPTY_MAPS: ValueMaps = {
  account: {},
  card: {},
  category: {},
  owner: {},
  paid: {},
  type: {},
};

// Spec 048 FR 29: the first value without a match below `afterKey` (then from the top), never `afterKey` itself.
function nextUnmatchedKey(
  entries: ValueEntry[],
  afterKey?: string,
): string | undefined {
  const start =
    afterKey === undefined
      ? -1
      : entries.findIndex((item) => item.key === afterKey);
  const ordered = [...entries.slice(start + 1), ...entries.slice(0, start + 1)];

  return ordered.find(
    (item) => item.selected === undefined && item.key !== afterKey,
  )?.key;
}

function recordEntries(
  tab: "account" | "card" | "category",
  column: number,
  rows: string[][],
  mapping: ColumnMapping,
  choices: ValueChoices,
  context: EntryContext,
): ValueEntry[] {
  const entries = new Map<string, ValueEntry>();

  for (const row of rows) {
    const value = (row[column] ?? "").trim();

    if (value === "" || (tab === "category" && isSystemCategoryName(value))) {
      continue;
    }

    const ownerId = ownerOfRow(
      row,
      mapping,
      context.ownerMap,
      context.defaultOwnerId,
    );
    const type =
      tab === "category"
        ? typeOfRow(row, mapping, context.decimal, {
            fixed: context.fixed,
            valueMaps: { ...EMPTY_MAPS, type: context.typeMap },
          })
        : undefined;
    const key =
      tab === "category"
        ? categoryKey(ownerId, type ?? "", value)
        : accountKey(ownerId, value);
    const known = entries.get(key);
    const card = tab === "category" && isCardRow(row, mapping, context.fixed);

    if (known) {
      known.rows += 1;
      known.cardRows = (known.cardRows ?? 0) + (card ? 1 : 0);
      continue;
    }

    const auto = autoSelection(
      tab,
      value,
      context.catalog[ownerId] ?? NO_RECORDS,
      type,
      card ? 1 : 0,
    );
    const chosen = choices[tab]?.[key];

    entries.set(key, {
      auto: chosen === undefined && auto !== undefined,
      cardRows: tab === "category" ? Number(card) : undefined,
      key,
      ownerId,
      rows: 1,
      selected: chosen ?? auto,
      type,
      value,
    });
  }

  // A value whose first row is not a card row can still have card rows later on (spec 048 FR 11).
  for (const entry of entries.values()) {
    if (
      tab === "category" &&
      entry.selected === undefined &&
      (entry.cardRows ?? 0) > 0
    ) {
      const auto = autoSelection(
        tab,
        entry.value,
        context.catalog[entry.ownerId ?? ""] ?? NO_RECORDS,
        entry.type,
        entry.cardRows,
      );

      entry.auto = auto !== undefined;
      entry.selected = auto;
    }
  }

  return [...entries.values()];
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
    owner: {},
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

// FR 22-24: the distinct values of the column with the app match (or the user's choice). Accounts, cards and
// categories are listed once per owner of the rows that use them (and categories once per type too) and matched only to
// the records of that owner (and type).
function valueEntries(
  tab: ValueTab,
  rows: string[][],
  mapping: ColumnMapping,
  choices: ValueChoices,
  context: EntryContext,
): ValueEntry[] {
  const [column] = columnsOf(mapping, TAB_TARGET[tab]);

  if (column === undefined) {
    return [];
  }

  if (tab === "account" || tab === "card" || tab === "category") {
    return recordEntries(tab, column, rows, mapping, choices, context);
  }

  return distinctValues(rows, column).map((item) => {
    const auto =
      tab === "owner"
        ? autoMatch(item.value, context.owners)
        : autoSelection(tab, item.value, NO_RECORDS);
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

export {
  misusedRows,
  nextUnmatchedKey,
  tabsOf,
  toValueMaps,
  unmatchedCount,
  valueEntries,
};
