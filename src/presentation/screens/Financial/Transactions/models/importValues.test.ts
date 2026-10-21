import { ColumnMapping } from "@application/csvImport/types";

import {
  ImportRecords,
  tabsOf,
  toValueMaps,
  unmatchedCount,
  valueEntries,
} from "./importValues";

const records: ImportRecords = {
  accounts: [{ id: "acc-1", name: "Corrente" }],
  cards: [{ id: "card-1", name: "Visa" }],
  categories: [
    { id: "cat-1", name: "Mercado", path: "Casa > Mercado" },
    { id: "cat-2", name: "Salário", path: "Salário" },
  ],
};
const mapping: ColumnMapping = {
  0: "date",
  1: "category",
  2: "card",
  3: "type",
  4: "paid",
};
const rows = [
  ["02/10/2026", "Mercado", "Visa", "Despesa", "Sim"],
  ["03/10/2026", "mercado", "Visa", "Receita", ""],
  ["04/10/2026", "Esporte", "", "x", "talvez"],
  ["05/10/2026", "Ajuste de saldo", "Master", "Despesa", "não"],
];

describe("tabsOf", () => {
  it("SHOULD give a tab per mapped record or fixed-set column, in tab order", () => {
    expect(tabsOf(mapping)).toEqual(["category", "card", "type", "paid"]);
    expect(tabsOf({ 0: "date", 1: "account" })).toEqual(["account"]);
    expect(tabsOf({ 0: "date", 1: "description" })).toEqual([]);
  });
});

describe("valueEntries", () => {
  it("SHOULD match categories by name ignoring case, count rows, and leave unknown ones unmatched", () => {
    const entries = valueEntries("category", rows, mapping, records, {});

    expect(entries.map((entry) => entry.value)).toEqual([
      "Mercado",
      "mercado",
      "Esporte",
    ]);
    expect(entries.map((entry) => entry.selected)).toEqual([
      "cat-1",
      "cat-1",
      undefined,
    ]);
  });

  it("SHOULD leave out the system category names", () => {
    const values = valueEntries("category", rows, mapping, records, {}).map(
      (entry) => entry.value,
    );

    expect(values).not.toContain("Ajuste de saldo");
  });

  it("SHOULD prefer the user's choice to the automatic match", () => {
    const [first] = valueEntries("category", rows, mapping, records, {
      category: { Mercado: "cat-2" },
    });

    expect(first).toMatchObject({ auto: false, selected: "cat-2" });
  });

  it("SHOULD match type and paid words, and the default for an empty paid cell never becomes a value", () => {
    expect(
      valueEntries("type", rows, mapping, records, {}).map((e) => e.selected),
    ).toEqual(["EXPENSE", "INCOME", undefined]);
    expect(
      valueEntries("paid", rows, mapping, records, {}).map((e) => e.selected),
    ).toEqual(["true", undefined, "false"]);
  });

  it("SHOULD match a card by title and flag the one that does not exist", () => {
    const entries = valueEntries("card", rows, mapping, records, {});

    expect(entries.map((entry) => [entry.value, entry.selected])).toEqual([
      ["Visa", "card-1"],
      ["Master", undefined],
    ]);
  });

  it("SHOULD return nothing for an unmapped tab", () => {
    expect(valueEntries("account", rows, mapping, records, {})).toEqual([]);
  });
});

describe("unmatchedCount / toValueMaps", () => {
  it("SHOULD count the values without a match", () => {
    expect(
      unmatchedCount(valueEntries("category", rows, mapping, records, {})),
    ).toBe(1);
  });

  it("SHOULD build the maps the row builder reads", () => {
    const maps = toValueMaps({
      card: valueEntries("card", rows, mapping, records, {}),
      category: valueEntries("category", rows, mapping, records, {}),
      paid: valueEntries("paid", rows, mapping, records, {}),
      type: valueEntries("type", rows, mapping, records, {}),
    });

    expect(maps.category).toEqual({ Mercado: "cat-1", mercado: "cat-1" });
    expect(maps.card).toEqual({ Visa: "card-1" });
    expect(maps.type).toEqual({ Despesa: "EXPENSE", Receita: "INCOME" });
    expect(maps.paid).toEqual({ não: false, Sim: true });
    expect(maps.account).toEqual({});
  });
});
