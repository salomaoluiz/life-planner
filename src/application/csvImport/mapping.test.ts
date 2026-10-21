import {
  applyTarget,
  canContinue,
  fieldStatuses,
  rowsWithCardAndAccount,
} from "./mapping";

describe("applyTarget", () => {
  it("SHOULD move a target to the new column and ignore the old one", () => {
    expect(applyTarget({ 0: "date", 1: "ignore" }, 1, "date")).toEqual({
      0: "ignore",
      1: "date",
    });
  });

  it("SHOULD clear the other ways of giving the amount", () => {
    expect(
      applyTarget({ 0: "amount", 1: "type", 2: "ignore" }, 2, "signedAmount"),
    ).toEqual({
      0: "ignore",
      1: "type",
      2: "signedAmount",
    });
    expect(
      applyTarget(
        { 0: "signedAmount", 1: "ignore", 2: "ignore" },
        1,
        "incomeAmount",
      ),
    ).toEqual({
      0: "ignore",
      1: "incomeAmount",
      2: "ignore",
    });
  });

  it("SHOULD keep the income and expense columns together", () => {
    expect(
      applyTarget({ 0: "incomeAmount", 1: "ignore" }, 1, "expenseAmount"),
    ).toEqual({
      0: "incomeAmount",
      1: "expenseAmount",
    });
  });

  it("SHOULD let several columns be ignored", () => {
    expect(applyTarget({ 0: "ignore", 1: "date" }, 0, "ignore")).toEqual({
      0: "ignore",
      1: "date",
    });
  });
});

describe("fieldStatuses", () => {
  const mapping = {
    0: "date",
    1: "description",
    2: "signedAmount",
    3: "category",
    4: "card",
  } as const;
  const rows = [
    ["02/10/2026", "Mercado", "-10,00", "Mercado", "Visa"],
    ["03/10/2026", "Salário", "10,00", "Salário", ""],
    ["04/10/2026", "Farmácia", "-5,00", "Saúde", ""],
  ];
  function find(statuses: ReturnType<typeof fieldStatuses>, field: string) {
    return statuses.find((status) => status.field === field);
  }

  it("SHOULD flag Account or card with the number of rows the column leaves empty", () => {
    const statuses = fieldStatuses(mapping, {}, rows);

    expect(find(statuses, "accountOrCard")).toEqual({
      field: "accountOrCard",
      missingRows: 2,
      ok: false,
      source: "column",
    });
    expect(canContinue(statuses)).toBe(false);
  });

  it("SHOULD be covered by a fixed account for those rows", () => {
    const statuses = fieldStatuses(
      mapping,
      { accountOrCard: { id: "acc", kind: "account" } },
      rows,
    );

    expect(find(statuses, "accountOrCard")?.ok).toBe(true);
    expect(canContinue(statuses)).toBe(true);
  });

  it("SHOULD flag every required field that nothing covers", () => {
    const statuses = fieldStatuses({ 0: "ignore" }, {}, rows);

    expect(statuses.map((status) => [status.field, status.ok])).toEqual([
      ["date", false],
      ["description", false],
      ["amountAndType", false],
      ["category", false],
      ["accountOrCard", false],
    ]);
    expect(find(statuses, "accountOrCard")?.missingRows).toBe(3);
  });

  it("SHOULD cover the amount with Amount + Type, a fixed type, or income and expense columns", () => {
    expect(
      find(fieldStatuses({ 0: "amount", 1: "type" }, {}, rows), "amountAndType")
        ?.ok,
    ).toBe(true);
    expect(
      find(fieldStatuses({ 0: "amount" }, {}, rows), "amountAndType")?.ok,
    ).toBe(false);
    expect(
      find(
        fieldStatuses({ 0: "amount" }, { type: "EXPENSE" }, rows),
        "amountAndType",
      ),
    ).toMatchObject({
      ok: true,
      source: "fixed",
    });
    expect(
      find(
        fieldStatuses({ 0: "incomeAmount", 1: "expenseAmount" }, {}, rows),
        "amountAndType",
      )?.ok,
    ).toBe(true);
  });

  it("SHOULD cover the category with a fixed category", () => {
    expect(
      find(
        fieldStatuses({ 0: "ignore" }, { categoryId: "cat" }, rows),
        "category",
      ),
    ).toMatchObject({
      ok: true,
      source: "fixed",
    });
  });
});

describe("rowsWithCardAndAccount", () => {
  it("SHOULD count the rows that fill both the card and the account", () => {
    const mapping = { 0: "account", 1: "card" } as const;

    expect(
      rowsWithCardAndAccount(
        [
          ["Corrente", "Visa"],
          ["", "Visa"],
          ["Corrente", " "],
          ["Corrente", "Visa"],
        ],
        mapping,
      ),
    ).toBe(2);
  });

  it("SHOULD be zero WHEN a column is not mapped", () => {
    expect(rowsWithCardAndAccount([["a", "b"]], { 0: "account" })).toBe(0);
  });
});
