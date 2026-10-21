import { BuildInput, buildRows } from "./buildRows";

const base: BuildInput = {
  dateFormat: "dd/mm/yyyy",
  decimal: ",",
  fixed: {},
  mapping: {
    0: "date",
    1: "description",
    2: "signedAmount",
    3: "category",
    4: "card",
  },
  rows: [],
  valueMaps: {
    account: {},
    card: { Visa: "card-1" },
    category: {
      "EXPENSE|Mercado": "cat-1",
      "INCOME|Mercado": "cat-1",
      "INCOME|Salário": "cat-2",
    },
    paid: {},
    type: {},
  },
};
function withRows(
  rows: string[][],
  extra: Partial<BuildInput> = {},
): BuildInput {
  return { ...base, ...extra, rows };
}

describe("buildRows", () => {
  it("SHOULD build the payload of an account row from a signed amount (line = index + 2)", () => {
    const { rows } = buildRows(
      withRows([["02/10/2026", "Supermercado", "-312,40", "Mercado", ""]], {
        fixed: { accountOrCard: { id: "acc-1", kind: "account" } },
      }),
    );

    expect(rows[0].payload).toEqual({
      accountId: "acc-1",
      categoryId: "cat-1",
      creditCardId: undefined,
      currency: undefined,
      date: "2026-10-02",
      description: "Supermercado",
      line: 2,
      paid: undefined,
      tags: undefined,
      type: "EXPENSE",
      value: 31240,
    });
  });

  it("SHOULD build a card row from the card column and treat a positive signed amount as income", () => {
    const { rows } = buildRows(
      withRows([
        ["02/10/2026", "Streaming", "-39,90", "Mercado", "Visa"],
        ["03/10/2026", "Salário", "5.200,00", "Salário", "Visa"],
      ]),
    );

    expect(rows[0].payload).toMatchObject({
      creditCardId: "card-1",
      type: "EXPENSE",
      value: 3990,
    });
    expect(rows[1].payload).toMatchObject({
      line: 3,
      type: "INCOME",
      value: 520000,
    });
  });

  it("SHOULD report an impossible date as INVALID_DATE and keep the cells for display", () => {
    const { rows } = buildRows(
      withRows([["31/09/2026", "Uber", "-23,10", "Mercado", "Visa"]]),
    );

    expect(rows[0].error).toBe("INVALID_DATE");
    expect(rows[0].payload).toBeUndefined();
    expect(rows[0].display).toEqual({
      amount: "-23,10",
      date: "31/09/2026",
      description: "Uber",
    });
  });

  it("SHOULD report a bad amount, a missing category and a missing account or card", () => {
    const { rows } = buildRows(
      withRows([
        ["02/10/2026", "a", "0,00", "Mercado", "Visa"],
        ["02/10/2026", "b", "-1,00", "", "Visa"],
        ["02/10/2026", "c", "-1,00", "Mercado", ""],
      ]),
    );

    expect(rows.map((row) => row.error)).toEqual([
      "INVALID_VALUE",
      "CATEGORY_MISSING",
      "ACCOUNT_OR_CARD_MISSING",
    ]);
  });

  it("SHOULD use the fixed category for rows without one", () => {
    const { rows } = buildRows(
      withRows([["02/10/2026", "b", "-1,00", "", "Visa"]], {
        fixed: { categoryId: "cat-9" },
      }),
    );

    expect(rows[0].payload?.categoryId).toBe("cat-9");
  });

  it("SHOULD read Amount + Type with the matched type, or the fixed type", () => {
    const input = withRows(
      [
        ["02/10/2026", "a", "10,00", "Mercado", "Visa", "Despesa"],
        ["02/10/2026", "b", "10,00", "Salário", "Visa", ""],
      ],
      {
        fixed: { type: "INCOME" },
        mapping: {
          0: "date",
          1: "description",
          2: "amount",
          3: "category",
          4: "card",
          5: "type",
        },
        valueMaps: { ...base.valueMaps, type: { Despesa: "EXPENSE" } },
      },
    );
    const { rows } = buildRows(input);

    expect(rows.map((row) => row.payload?.type)).toEqual(["EXPENSE", "INCOME"]);
    expect(
      buildRows({ ...input, fixed: {}, rows: [input.rows[1]] }).rows[0].error,
    ).toBe("TYPE_MISSING");
  });

  it("SHOULD read Income + Expense columns and refuse both or neither filled", () => {
    const input = withRows(
      [
        ["02/10/2026", "a", "10,00", "", "Mercado", "Visa"],
        ["02/10/2026", "b", "", "5,00", "Mercado", "Visa"],
        ["02/10/2026", "c", "1,00", "1,00", "Mercado", "Visa"],
        ["02/10/2026", "d", "", "", "Mercado", "Visa"],
      ],
      {
        mapping: {
          0: "date",
          1: "description",
          2: "incomeAmount",
          3: "expenseAmount",
          4: "category",
          5: "card",
        },
      },
    );
    const { rows } = buildRows(input);

    expect(rows.map((row) => row.payload?.type ?? row.error)).toEqual([
      "INCOME",
      "EXPENSE",
      "AMOUNT_BOTH_OR_NONE",
      "AMOUNT_BOTH_OR_NONE",
    ]);
  });

  it("SHOULD carry currency, paid and tags from their columns", () => {
    const { rows } = buildRows(
      withRows(
        [
          [
            "02/10/2026",
            "a",
            "-1,00",
            "Mercado",
            "Visa",
            "usd",
            "Sim",
            "fixo | mensal",
          ],
        ],
        {
          mapping: { ...base.mapping, 5: "currency", 6: "paid", 7: "tags" },
          valueMaps: { ...base.valueMaps, paid: { Sim: true } },
        },
      ),
    );

    expect(rows[0].payload).toMatchObject({
      currency: "USD",
      paid: true,
      tags: ["fixo", "mensal"],
    });
  });

  it("SHOULD skip and count system category rows", () => {
    const result = buildRows(
      withRows([
        ["02/10/2026", "Ajuste", "-1,00", "Ajuste de saldo", ""],
        ["02/10/2026", "Fatura", "-1,00", "Invoice payment", ""],
        ["02/10/2026", "Ok", "-1,00", "Mercado", "Visa"],
      ]),
    );

    expect(result.ignoredSystemRows).toBe(2);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].line).toBe(4);
  });
});
