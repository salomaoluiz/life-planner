import { ColumnMapping } from "@application/csvImport/types";

import {
  EntryContext,
  ImportRecords,
  misusedRows,
  nextUnmatchedKey,
  tabsOf,
  toValueMaps,
  unmatchedCount,
  valueEntries,
} from "./importValues";

const records: ImportRecords = {
  accounts: [{ currency: "BRL", id: "acc-1", name: "Corrente" }],
  cards: [{ closingDay: 10, currency: "BRL", id: "card-1", name: "Visa" }],
  categories: [
    {
      depthLevel: 1,
      iconColor: "#EF4444",
      id: "cat-1",
      name: "Mercado",
      path: "Casa > Mercado",
      type: "EXPENSE",
    },
    {
      depthLevel: 0,
      iconColor: "#EF4444",
      id: "cat-2",
      name: "Salário",
      path: "Salário",
      type: "INCOME",
    },
  ],
};
const familyRecords: ImportRecords = {
  accounts: [{ currency: "BRL", id: "acc-f", name: "Corrente" }],
  cards: [],
  categories: [
    {
      depthLevel: 0,
      iconColor: "#EF4444",
      id: "cat-f",
      name: "Mercado",
      path: "Mercado",
      type: "EXPENSE",
    },
  ],
};
const context: EntryContext = {
  catalog: { f1: familyRecords, u1: records },
  decimal: ",",
  defaultOwnerId: "u1",
  fixed: {},
  ownerMap: {},
  owners: [
    { id: "u1", names: ["Pessoal", "Personal", "Me"] },
    { id: "f1", names: ["Família"] },
  ],
  typeMap: {},
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
const typed = {
  ...context,
  typeMap: { Despesa: "EXPENSE", Receita: "INCOME" } as const,
};

describe("tabsOf", () => {
  it("SHOULD give a tab per mapped record or fixed-set column, in tab order", () => {
    expect(tabsOf(mapping)).toEqual(["category", "card", "type", "paid"]);
    expect(tabsOf({ 0: "date", 1: "account" })).toEqual(["account"]);
    expect(tabsOf({ 0: "date", 1: "description" })).toEqual([]);
    expect(tabsOf({ 0: "owner", 1: "category" })).toEqual([
      "owner",
      "category",
    ]);
  });
});

describe("valueEntries", () => {
  it("SHOULD match categories of the type of their rows, ignoring case, and leave unknown ones unmatched", () => {
    const entries = valueEntries("category", rows, mapping, {}, typed);

    expect(entries.map((entry) => [entry.value, entry.type])).toEqual([
      ["Mercado", "EXPENSE"],
      ["mercado", "INCOME"],
      ["Esporte", undefined],
    ]);
    // "mercado" is an INCOME row: the only Mercado is an expense category.
    expect(entries.map((entry) => entry.selected)).toEqual([
      "cat-1",
      undefined,
      undefined,
    ]);
  });

  it("SHOULD leave out the system category names", () => {
    const values = valueEntries("category", rows, mapping, {}, typed).map(
      (entry) => entry.value,
    );

    expect(values).not.toContain("Ajuste de saldo");
  });

  it("SHOULD prefer the user's choice to the automatic match", () => {
    const [first] = valueEntries(
      "category",
      rows,
      mapping,
      { category: { "u1|EXPENSE|Mercado": "cat-2" } },
      typed,
    );

    expect(first).toMatchObject({ auto: false, selected: "cat-2" });
  });

  it("SHOULD match type and paid words, and keep the default for an empty paid cell out of the values", () => {
    expect(
      valueEntries("type", rows, mapping, {}, context).map((e) => e.selected),
    ).toEqual(["EXPENSE", "INCOME", undefined]);
    expect(
      valueEntries("paid", rows, mapping, {}, context).map((e) => e.selected),
    ).toEqual(["true", undefined, "false"]);
  });

  it("SHOULD match a card by title in the owner and flag the one that does not exist", () => {
    const entries = valueEntries("card", rows, mapping, {}, context);

    expect(entries.map((entry) => [entry.value, entry.selected])).toEqual([
      ["Visa", "card-1"],
      ["Master", undefined],
    ]);
  });

  it("SHOULD return nothing for an unmapped tab", () => {
    expect(valueEntries("account", rows, mapping, {}, context)).toEqual([]);
  });
});

describe("unmatchedCount / toValueMaps", () => {
  it("SHOULD count the values without a match", () => {
    expect(
      unmatchedCount(valueEntries("category", rows, mapping, {}, typed)),
    ).toBe(2);
  });

  it("SHOULD build the maps the row builder reads, keyed by owner", () => {
    const maps = toValueMaps({
      card: valueEntries("card", rows, mapping, {}, typed),
      category: valueEntries("category", rows, mapping, {}, typed),
      paid: valueEntries("paid", rows, mapping, {}, typed),
      type: valueEntries("type", rows, mapping, {}, typed),
    });

    expect(maps.category).toEqual({ "u1|EXPENSE|Mercado": "cat-1" });
    expect(maps.card).toEqual({ "u1|Visa": "card-1" });
    expect(maps.type).toEqual({ Despesa: "EXPENSE", Receita: "INCOME" });
    expect(maps.paid).toEqual({ não: false, Sim: true });
    expect(maps.account).toEqual({});
  });
});

describe("owner per row", () => {
  const withOwner: ColumnMapping = {
    0: "category",
    1: "account",
    2: "owner",
    3: "signedAmount",
  };
  const data = [
    ["Mercado", "Corrente", "Família", "-10,00"],
    ["Mercado", "Corrente", "Pessoal", "-10,00"],
    ["Mercado", "Corrente", "", "-10,00"],
  ];

  it("SHOULD match each value of the owner column to an owner by name", () => {
    const entries = valueEntries("owner", data, withOwner, {}, context);

    expect(entries.map((e) => [e.value, e.selected])).toEqual([
      ["Família", "f1"],
      ["Pessoal", "u1"],
    ]);
  });

  it("SHOULD list accounts and categories once per owner and match them in the owner of the rows", () => {
    const ctx = { ...context, ownerMap: { Família: "f1", Pessoal: "u1" } };
    const accounts = valueEntries("account", data, withOwner, {}, ctx);
    const categories = valueEntries("category", data, withOwner, {}, ctx);

    expect(accounts.map((e) => [e.ownerId, e.rows, e.selected])).toEqual([
      ["f1", 1, "acc-f"],
      // Personal and the empty cell (default owner) are the same owner.
      ["u1", 2, "acc-1"],
    ]);
    expect(categories.map((e) => [e.ownerId, e.selected])).toEqual([
      ["f1", "cat-f"],
      ["u1", "cat-1"],
    ]);
  });

  it("SHOULD key the maps by owner so the same name keeps two answers", () => {
    const ctx = { ...context, ownerMap: { Família: "f1", Pessoal: "u1" } };
    const maps = toValueMaps({
      account: valueEntries("account", data, withOwner, {}, ctx),
      owner: valueEntries("owner", data, withOwner, {}, context),
    });

    expect(maps.account).toEqual({
      "f1|Corrente": "acc-f",
      "u1|Corrente": "acc-1",
    });
    expect(maps.owner).toEqual({ Família: "f1", Pessoal: "u1" });
  });

  it("SHOULD leave an owner value without a match unmatched", () => {
    const entries = valueEntries(
      "owner",
      [["x", "y", "Outra", "1,00"]],
      withOwner,
      {},
      context,
    );

    expect(entries[0].selected).toBeUndefined();
  });
});

describe("card credits (spec 048)", () => {
  const REFUND = "00000000-0000-4000-8000-000000000004";
  const INVOICE_PAYMENT = "00000000-0000-4000-8000-000000000002";
  const creditMapping: ColumnMapping = {
    0: "date",
    1: "category",
    2: "card",
    3: "account",
    4: "type",
  };
  const creditRows = [
    ["02/10/2026", "Estorno", "Visa", "", "Receita"],
    ["03/10/2026", "Estorno", "", "Corrente", "Receita"],
    ["04/10/2026", "Pagamento de fatura", "Visa", "Corrente", "Despesa"],
    ["05/10/2026", "Pagamento de fatura", "", "Corrente", "Despesa"],
    ["06/10/2026", "Desconto de adiantamento", "", "Corrente", "Receita"],
  ];

  function categories() {
    return valueEntries("category", creditRows, creditMapping, {}, typed);
  }

  it("SHOULD match a value used by a card row to the system category by name, in both languages", () => {
    const [refund, payment] = categories();

    expect(refund).toMatchObject({ auto: true, cardRows: 1, selected: REFUND });
    expect(payment).toMatchObject({ cardRows: 1, selected: INVOICE_PAYMENT });
  });

  it("SHOULD not match a system category WHEN no row of the value is a card row", () => {
    const discount = categories().find(
      (entry) => entry.value === "Desconto de adiantamento",
    );

    expect(discount?.selected).toBeUndefined();
    expect(discount?.cardRows).toBe(0);
  });

  it("SHOULD count the rows that can't use the chosen system category", () => {
    const [refund, payment, discount] = categories();

    expect(misusedRows(refund)).toBe(1);
    expect(misusedRows(payment)).toBe(1);
    expect(misusedRows({ ...discount, selected: "cat-2" })).toBe(0);
  });

  it("SHOULD not list the matched system values as unmatched", () => {
    expect(unmatchedCount(categories())).toBe(1);
  });

  it("SHOULD match WHEN the first row of the value is an account row and a later one is a card row", () => {
    const [refund] = valueEntries(
      "category",
      [
        ["02/10/2026", "Estorno", "", "Corrente", "Receita"],
        ["03/10/2026", "Estorno", "Visa", "", "Receita"],
      ],
      creditMapping,
      {},
      typed,
    );

    expect(refund.selected).toBe(REFUND);
  });
});

describe("nextUnmatchedKey (spec 048 FR 29)", () => {
  function entry(key: string, selected?: string) {
    return { auto: false, key, rows: 1, selected, value: key };
  }
  const entries = [
    entry("a", "x"),
    entry("b"),
    entry("c", "x"),
    entry("d"),
    entry("e"),
  ];

  it("SHOULD give the next value without a match below the given one", () => {
    expect(nextUnmatchedKey(entries, "b")).toBe("d");
    expect(nextUnmatchedKey(entries, "d")).toBe("e");
  });

  it("SHOULD wrap to the top WHEN none is left below", () => {
    expect(nextUnmatchedKey(entries, "e")).toBe("b");
  });

  it("SHOULD start from the top WITHOUT a given value, and be undefined WHEN all are matched", () => {
    expect(nextUnmatchedKey(entries)).toBe("b");
    expect(nextUnmatchedKey([entry("a", "x")], "a")).toBeUndefined();
  });

  it("SHOULD skip the given value itself even while it is still unmatched", () => {
    expect(nextUnmatchedKey([entry("a"), entry("b")], "a")).toBe("b");
    expect(nextUnmatchedKey([entry("a")], "a")).toBeUndefined();
  });
});
