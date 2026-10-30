import { BuildInput, buildRows } from "./buildRows";

const base: BuildInput = {
  dateFormat: "dd/mm/yyyy",
  decimal: ",",
  defaultOwnerId: "u1",
  fixed: {},
  mapping: {
    0: "date",
    1: "description",
    2: "signedAmount",
    3: "category",
    4: "card",
  },
  ownerTypes: { f1: "FAMILY", u1: "USER" },
  rows: [],
  valueMaps: {
    account: {},
    card: { "u1|Visa": "card-1" },
    category: {
      "u1|EXPENSE|Mercado": "cat-1",
      "u1|INCOME|Mercado": "cat-1",
      "u1|INCOME|Salário": "cat-2",
    },
    owner: {},
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
      notes: undefined,
      owner: "USER",
      ownerId: "u1",
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

  it("SHOULD skip and count balance adjustments only (spec 048 FR 4)", () => {
    const result = buildRows(
      withRows([
        ["02/10/2026", "Ajuste", "-1,00", "Ajuste de saldo", ""],
        ["02/10/2026", "Ok", "-1,00", "Mercado", "Visa"],
      ]),
    );

    expect(result.ignoredSystemRows).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].line).toBe(3);
  });
});

describe("owner per row", () => {
  const input = withRows(
    [
      ["02/10/2026", "a", "-1,00", "Mercado", "Rico", "Família"],
      ["03/10/2026", "b", "-2,00", "Mercado", "Rico", ""],
      ["04/10/2026", "c", "-3,00", "Mercado", "Rico", "Pessoal"],
    ],
    {
      mapping: {
        0: "date",
        1: "description",
        2: "signedAmount",
        3: "category",
        4: "account",
        5: "owner",
      },
      valueMaps: {
        account: { "f1|Rico": "acc-f", "u1|Rico": "acc-u" },
        card: {},
        category: {
          "f1|EXPENSE|Mercado": "cat-f",
          "u1|EXPENSE|Mercado": "cat-u",
        },
        owner: { Família: "f1", Pessoal: "u1" },
        paid: {},
        type: {},
      },
    },
  );

  it("SHOULD match the account and the category in the owner of each row, with the same names", () => {
    const { rows } = buildRows(input);

    expect(
      rows.map((row) => [
        row.payload?.ownerId,
        row.payload?.accountId,
        row.payload?.categoryId,
      ]),
    ).toEqual([
      ["f1", "acc-f", "cat-f"],
      ["u1", "acc-u", "cat-u"],
      ["u1", "acc-u", "cat-u"],
    ]);
  });

  it("SHOULD send the owner type, and the default owner for an empty cell", () => {
    const { rows } = buildRows(input);

    expect(rows.map((row) => row.payload?.owner)).toEqual([
      "FAMILY",
      "USER",
      "USER",
    ]);
  });

  it("SHOULD use the default owner for every row WHEN the file has no owner column", () => {
    const { rows } = buildRows({
      ...input,
      mapping: { ...input.mapping, 5: "ignore" },
    });

    expect(rows.map((row) => row.payload?.ownerId)).toEqual(["u1", "u1", "u1"]);
  });

  describe("spec 048 card credits and payments", () => {
    const REFUND = "00000000-0000-4000-8000-000000000004";
    const INVOICE_PAYMENT = "00000000-0000-4000-8000-000000000002";
    const credits = {
      mapping: {
        0: "date",
        1: "description",
        2: "signedAmount",
        3: "category",
        4: "card",
        5: "account",
        6: "invoice",
      } as BuildInput["mapping"],
      valueMaps: {
        ...base.valueMaps,
        account: { "u1|Corrente": "acc-1" },
        category: {
          ...base.valueMaps.category,
          "u1|EXPENSE|Pagamento de fatura": INVOICE_PAYMENT,
          "u1|INCOME|Estorno": REFUND,
        },
      },
    };

    it("SHOULD send the invoice month of a card row, accepting the app export format", () => {
      const { rows } = buildRows(
        withRows(
          [
            [
              "02/10/2026",
              "Estorno loja",
              "12,00",
              "Estorno",
              "Visa",
              "",
              "09/2026",
            ],
          ],
          credits,
        ),
      );

      expect(rows[0].payload).toMatchObject({
        categoryId: REFUND,
        creditCardId: "card-1",
        invoiceMonth: "2026-09",
        type: "INCOME",
      });
    });

    it("SHOULD not send an invoice month on an account row", () => {
      const { rows } = buildRows(
        withRows(
          [
            [
              "02/10/2026",
              "Mercado",
              "-312,40",
              "Mercado",
              "",
              "Corrente",
              "09/2026",
            ],
          ],
          credits,
        ),
      );

      expect(rows[0].payload?.invoiceMonth).toBeUndefined();
      expect(rows[0].error).toBeUndefined();
    });

    it("SHOULD flag an invoice month it cannot read on a card row", () => {
      const { rows } = buildRows(
        withRows(
          [
            [
              "02/10/2026",
              "Mercado",
              "-312,40",
              "Mercado",
              "Visa",
              "",
              "setembro",
            ],
          ],
          credits,
        ),
      );

      expect(rows[0].error).toBe("INVOICE_MONTH_INVALID");
    });

    it("SHOULD send the account of an invoice payment as paidFromAccountId", () => {
      const { rows } = buildRows(
        withRows(
          [
            [
              "02/10/2026",
              "Pagamento fatura",
              "-6.700,24",
              "Pagamento de fatura",
              "Visa",
              "Corrente",
              "09/2026",
            ],
          ],
          credits,
        ),
      );

      expect(rows[0].payload).toMatchObject({
        categoryId: INVOICE_PAYMENT,
        creditCardId: "card-1",
        invoiceMonth: "2026-09",
        paidFromAccountId: "acc-1",
        value: 670024,
      });
      expect(rows[0].payload?.accountId).toBeUndefined();
    });

    it("SHOULD skip an invoice payment on an account without a card and count it", () => {
      const result = buildRows(
        withRows(
          [
            [
              "02/10/2026",
              "Pagamento fatura",
              "-6.700,24",
              "Pagamento de fatura",
              "",
              "Corrente",
              "",
            ],
          ],
          credits,
        ),
      );

      expect(result.rows).toEqual([]);
      expect(result.ignoredSystemRows).toBe(1);
    });

    it("SHOULD keep card and account on a row that is not a payment, for the server to refuse", () => {
      const { rows } = buildRows(
        withRows(
          [
            [
              "02/10/2026",
              "Mercado",
              "-312,40",
              "Mercado",
              "Visa",
              "Corrente",
              "",
            ],
          ],
          credits,
        ),
      );

      expect(rows[0].payload).toMatchObject({
        accountId: "acc-1",
        creditCardId: "card-1",
      });
    });
  });
});

describe("notes (spec 059)", () => {
  it("SHOULD carry the trimmed notes of the Notes column AND leave it out WHEN empty", () => {
    const { rows } = buildRows(
      withRows(
        [
          [
            "02/10/2026",
            "Uber",
            "-38,70",
            "Mercado",
            "",
            "  Casa → Aeroporto ",
          ],
          ["03/10/2026", "Padaria", "-5,00", "Mercado", "", ""],
        ],
        {
          fixed: { accountOrCard: { id: "acc-1", kind: "account" } },
          mapping: { ...base.mapping, 5: "notes" },
        },
      ),
    );

    expect(rows[0].payload?.notes).toBe("Casa → Aeroporto");
    expect(rows[1].payload?.notes).toBeUndefined();
  });
});
