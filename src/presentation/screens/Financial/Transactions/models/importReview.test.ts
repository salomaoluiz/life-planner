import { BuiltRow } from "@application/csvImport/buildRows";

import {
  bulkSelection,
  canImport,
  currencyTotals,
  filterRows,
  groupKeyOf,
  importPayloads,
  invoiceLines,
  kindCounts,
  mergeValidation,
  revalidationRequest,
  reviewBlockOf,
  reviewGroups,
  reviewRows,
  selectionKey,
  summarize,
} from "./importReview";

function payload(line: number) {
  return {
    accountId: "a1",
    categoryId: "c1",
    date: "2026-10-02",
    description: "x",
    line,
    type: "EXPENSE" as const,
    value: 100,
  };
}

const display = { amount: "1,00", date: "02/10/2026", description: "x" };
const built: BuiltRow[] = [
  { display, line: 2, payload: payload(2) },
  { display, line: 3, payload: payload(3) },
  { display, error: "INVALID_DATE", line: 4 },
  { display, line: 5, payload: payload(5) },
  { display, line: 6, payload: payload(6) },
];
const validation = {
  duplicates: [3, 6],
  errors: [{ code: "CURRENCY_MISMATCH", line: 5, message: "USD ≠ BRL" }],
};

describe("reviewRows", () => {
  it("SHOULD come with duplicates unchecked and ready rows checked", () => {
    const rows = reviewRows(built, validation, {});

    expect(rows.map((row) => [row.line, row.checked, row.duplicate])).toEqual([
      [2, true, false],
      [3, false, true],
      [4, true, false],
      [5, true, false],
      [6, false, true],
    ]);
  });

  it("SHOULD lock a row with an error on, local or from the API, and keep the API message", () => {
    const rows = reviewRows(built, validation, { 4: false, 5: false });

    expect(rows[2]).toMatchObject({
      checked: true,
      errorCode: "INVALID_DATE",
      locked: true,
    });
    expect(rows[3]).toMatchObject({
      checked: true,
      errorCode: "CURRENCY_MISMATCH",
      errorMessage: "USD ≠ BRL",
      locked: true,
    });
    expect(rows[2].duplicate).toBe(false);
  });

  it("SHOULD let the user check a duplicate and uncheck a ready row", () => {
    const rows = reviewRows(built, validation, { 2: false, 3: true });

    expect(rows[0].checked).toBe(false);
    expect(rows[1].checked).toBe(true);
  });

  it("SHOULD treat every row as ready before the dry run answers", () => {
    const rows = reviewRows(built, undefined, {});

    expect(rows.filter((row) => row.duplicate)).toEqual([]);
    expect(rows[2].errorCode).toBe("INVALID_DATE");
  });
});

describe("filters, summary and import", () => {
  const rows = reviewRows(built, validation, {});

  it("SHOULD filter errors and duplicates", () => {
    expect(filterRows(rows, "ALL")).toHaveLength(5);
    expect(filterRows(rows, "ERRORS").map((row) => row.line)).toEqual([4, 5]);
    expect(filterRows(rows, "DUPLICATES").map((row) => row.line)).toEqual([
      3, 6,
    ]);
  });

  it("SHOULD summarize ready, duplicates and errors", () => {
    expect(summarize(rows)).toEqual({ duplicates: 2, errors: 2, ready: 1 });
  });

  it("SHOULD block the import while any row has an error, and when nothing is checked", () => {
    expect(canImport(summarize(rows))).toBe(false);

    const clean = reviewRows(
      built.slice(0, 2),
      { duplicates: [], errors: [] },
      {},
    );

    expect(canImport(summarize(clean))).toBe(true);
    expect(
      canImport(
        summarize(
          reviewRows(built.slice(0, 2), undefined, { 2: false, 3: false }),
        ),
      ),
    ).toBe(false);
  });

  it("SHOULD send only the checked rows without an error", () => {
    const clean = reviewRows(
      built,
      { duplicates: [3], errors: [] },
      { 6: false },
    );

    // line 4 has a local error: never sent.
    expect(importPayloads(clean).map((row) => row.line)).toEqual([2, 5]);
  });
});

describe("card credits and payments (spec 048)", () => {
  const REFUND = "00000000-0000-4000-8000-000000000004";
  const DISCOUNT = "00000000-0000-4000-8000-000000000003";
  const INVOICE_PAYMENT = "00000000-0000-4000-8000-000000000002";
  const rows = [
    { ...payload(2), categoryId: REFUND, creditCardId: "card-1" },
    { ...payload(3), categoryId: DISCOUNT, creditCardId: "card-1" },
    { ...payload(4), categoryId: INVOICE_PAYMENT, creditCardId: "card-1" },
    { ...payload(5), categoryId: INVOICE_PAYMENT, creditCardId: "card-1" },
    payload(6),
  ].map((item) => ({ display, line: item.line, payload: item }));

  it("SHOULD keep the params the API sent with an error line", () => {
    const review = reviewRows(
      rows.slice(3, 4),
      {
        duplicates: [],
        errors: [
          {
            code: "INVOICE_PAYMENT_MISMATCH",
            line: 5,
            message: "x",
            params: { due: 123000, month: "2026-08", value: 125000 },
          },
        ],
      },
      {},
    );

    expect(review[0].errorParams).toEqual({
      due: 123000,
      month: "2026-08",
      value: 125000,
    });
  });

  it("SHOULD count the credits and the invoice payments that will be imported", () => {
    const review = reviewRows(
      rows,
      {
        duplicates: [],
        errors: [{ code: "INVOICE_PAYMENT_MISMATCH", line: 5, message: "x" }],
      },
      {},
    );

    expect(kindCounts(review)).toEqual({ credits: 2, payments: 1 });
  });

  it("SHOULD name the invoices of the file with the card, the month and whether they end up paid", () => {
    expect(
      invoiceLines(
        [
          {
            amountDue: 670024,
            creditCardId: "card-1",
            invoiceMonth: "2026-09",
            paid: true,
          },
          {
            amountDue: 40000,
            creditCardId: "card-1",
            invoiceMonth: "2026-10",
            paid: false,
          },
        ],
        (id) => (id === "card-1" ? "Visa" : ""),
      ),
    ).toEqual([
      {
        card: "Visa",
        cents: 670024,
        id: "card-1.2026-09",
        month: "09/26",
        paid: true,
      },
      {
        card: "Visa",
        cents: 40000,
        id: "card-1.2026-10",
        month: "10/26",
        paid: false,
      },
    ]);
  });
});

describe("revalidation (spec 048)", () => {
  it("SHOULD send only the checked rows and name the checked duplicates", () => {
    const review = reviewRows(built, validation, { 3: true, 5: false });
    const request = revalidationRequest(review);

    // 2 ready, 3 duplicate checked by the user, 4 local error (no payload), 5 API error (locked on), 6 duplicate left unchecked
    expect(request.rows.map((row) => row.line)).toEqual([2, 3, 5]);
    expect(request.includeDuplicates).toEqual([3]);
  });

  it("SHOULD keep the duplicates found on the first check and take the rest from the latest one", () => {
    const merged = mergeValidation([3, 6], {
      duplicates: [3],
      errors: [{ code: "INVOICE_PAYMENT_MISMATCH", line: 5, message: "x" }],
      invoices: [],
    });

    expect(merged.duplicates).toEqual([3, 6]);
    expect(merged.errors).toHaveLength(1);
  });

  it("SHOULD recompute the review WITHOUT the error WHEN the new check has none", () => {
    const first = reviewRows(built, validation, {});
    const next = reviewRows(
      built,
      mergeValidation(validation.duplicates, {
        duplicates: [3],
        errors: [],
        invoices: [],
      }),
      { 3: true, 6: true },
    );

    expect(first.find((row) => row.line === 5)?.errorCode).toBe(
      "CURRENCY_MISMATCH",
    );
    expect(next.find((row) => row.line === 5)?.errorCode).toBeUndefined();
    // The duplicates it remembers are still duplicates, now checked on purpose.
    expect(
      next.filter((row) => row.duplicate).map((row) => [row.line, row.checked]),
    ).toEqual([
      [3, true],
      [6, true],
    ]);
  });
});

describe("review groups (spec 049)", () => {
  const REFUND = "00000000-0000-4000-8000-000000000004";
  const DISCOUNT = "00000000-0000-4000-8000-000000000003";
  const EARLY = "00000000-0000-4000-8000-000000000005";
  const PAYMENT = "00000000-0000-4000-8000-000000000002";
  const NO_ISSUES = { duplicates: [], errors: [] };
  const records = {
    accounts: [
      { currency: "BRL" as const, id: "a1", name: "Conta Corrente" },
      { currency: "USD" as const, id: "a2", name: "Dólar" },
    ],
    cards: [
      { currency: "BRL" as const, id: "card-1", name: "Nubank" },
      { currency: "USD" as const, id: "card-2", name: "Inter" },
    ],
  };

  // A built row of line `line`; the account/card is always explicit.
  function row(line: number, overrides = {}): BuiltRow {
    return {
      display,
      line,
      payload: { ...payload(line), accountId: undefined, ...overrides },
    };
  }

  it("SHOULD assign each row kind to its block", () => {
    const rows = reviewRows(
      [
        row(2, { accountId: "a1" }),
        row(3, { creditCardId: "card-1" }),
        row(4, { categoryId: REFUND, creditCardId: "card-1", type: "INCOME" }),
        row(5, {
          categoryId: DISCOUNT,
          creditCardId: "card-1",
          type: "INCOME",
        }),
        row(6, {
          categoryId: EARLY,
          creditCardId: "card-1",
          paidFromAccountId: "a1",
          type: "INCOME",
        }),
        row(7, {
          categoryId: PAYMENT,
          creditCardId: "card-1",
          paidFromAccountId: "a1",
        }),
        row(8, { accountId: "a1", creditCardId: "card-1" }),
        { display, error: "INVALID_DATE", line: 9 },
      ],
      NO_ISSUES,
      {},
    );

    expect(rows.map(reviewBlockOf)).toEqual([
      "account",
      "card",
      "card",
      "card",
      "card",
      "account",
      "card",
      "account",
    ]);
  });

  it("SHOULD group the account rows and the card rows by their record, in file order", () => {
    const rows = reviewRows(
      [
        row(2, { accountId: "a1" }),
        row(3, { accountId: "a1", type: "INCOME" }),
        row(4, { creditCardId: "card-1" }),
      ],
      NO_ISSUES,
      {},
    );
    const [account, card] = reviewGroups(rows, records);

    expect([account.block, card.block]).toEqual(["account", "card"]);
    expect(account.groups).toHaveLength(1);
    expect(account.groups[0]).toMatchObject({
      key: "account:a1",
      name: "Conta Corrente",
      total: 2,
    });
    expect(account.groups[0].rows.map((item) => item.line)).toEqual([2, 3]);
    expect(card.groups[0]).toMatchObject({
      key: "card:card-1",
      name: "Nubank",
      total: 1,
    });
    expect(groupKeyOf(rows[0], records)).toBe("account:a1");
    expect(groupKeyOf(rows[2], records)).toBe("card:card-1");
  });

  it("SHOULD group an invoice payment under the paying account, or under Boleto", () => {
    const rows = reviewRows(
      [
        row(2, {
          categoryId: PAYMENT,
          creditCardId: "card-1",
          paidFromAccountId: "a1",
        }),
        row(3, { categoryId: PAYMENT, creditCardId: "card-1" }),
      ],
      NO_ISSUES,
      {},
    );
    const [account] = reviewGroups(rows, records);

    expect(account.groups.map((group) => group.key)).toEqual([
      "account:a1",
      "boleto",
    ]);
    expect(account.groups[1].nameKey).toBe("financial.import.review.boleto");
  });

  it("SHOULD put unresolved records and rows without a record in their own groups", () => {
    const rows = reviewRows(
      [
        row(2, { accountId: "gone" }),
        row(3, { creditCardId: "card-gone" }),
        row(4, { accountId: "a1" }),
        row(5, { categoryId: PAYMENT, creditCardId: "card-1" }),
        { display, error: "ACCOUNT_OR_CARD_MISSING", line: 6 },
      ],
      NO_ISSUES,
      {},
    );
    const [account, card] = reviewGroups(rows, records);

    expect(account.groups.map((group) => group.key)).toEqual([
      "account:a1",
      "missing-account",
      "boleto",
      "none",
    ]);
    expect(account.groups[3].nameKey).toBe(
      "financial.import.review.groups.noRecord",
    );
    expect(card.groups[0]).toMatchObject({
      key: "missing-card",
      nameKey: "financial.import.review.groups.noCard",
    });
  });

  it("SHOULD order the records case- and accent-insensitively", () => {
    const named = {
      accounts: [
        { currency: "BRL" as const, id: "a1", name: "álcool" },
        { currency: "BRL" as const, id: "a2", name: "Banco" },
        { currency: "BRL" as const, id: "a3", name: "zebra" },
      ],
      cards: [],
    };
    const rows = reviewRows(
      [
        row(2, { accountId: "a3" }),
        row(3, { accountId: "a1" }),
        row(4, { accountId: "a2" }),
      ],
      NO_ISSUES,
      {},
    );

    expect(
      reviewGroups(rows, named)[0].groups.map((group) => group.name),
    ).toEqual(["álcool", "Banco", "zebra"]);
  });

  it("SHOULD subtotal only the checked rows without an error, per currency", () => {
    const rows = reviewRows(
      [
        row(2, { accountId: "a1", type: "EXPENSE", value: 1000 }),
        row(3, { accountId: "a1", type: "INCOME", value: 1200 }),
        row(4, { accountId: "a1", type: "EXPENSE", value: 500 }),
        row(5, { accountId: "a1", type: "INCOME", value: 700 }),
      ],
      {
        duplicates: [],
        errors: [{ code: "CURRENCY_MISMATCH", line: 5, message: "x" }],
      },
      { 4: false },
    );
    const [account] = reviewGroups(rows, records);
    const group = account.groups[0];

    expect(group.selected).toBe(3);
    expect(group.total).toBe(4);
    expect(group.unchecked).toBe(1);
    expect(group.income).toEqual([{ cents: 1200, currency: "BRL" }]);
    expect(group.expenses).toEqual([{ cents: 1000, currency: "BRL" }]);
    expect(account).toMatchObject({ selected: 3, total: 4 });
  });

  it("SHOULD count a checked duplicate and leave an unchecked one out", () => {
    const builtRows = [
      row(2, { accountId: "a1", type: "EXPENSE", value: 1000 }),
      row(3, { accountId: "a1", type: "EXPENSE", value: 500 }),
    ];
    const duplicate = { duplicates: [3], errors: [] };
    const unchecked = reviewGroups(
      reviewRows(builtRows, duplicate, {}),
      records,
    );
    const checked = reviewGroups(
      reviewRows(builtRows, duplicate, { 3: true }),
      records,
    );

    expect(unchecked[0].groups[0].expenses).toEqual([
      { cents: 1000, currency: "BRL" },
    ]);
    expect(checked[0].groups[0].expenses).toEqual([
      { cents: 1500, currency: "BRL" },
    ]);
  });

  it("SHOULD keep one pair per currency, BRL first, without converting", () => {
    const rows = reviewRows(
      [
        row(2, {
          categoryId: REFUND,
          creditCardId: "card-1",
          type: "INCOME",
          value: 34500,
        }),
        row(3, {
          categoryId: REFUND,
          creditCardId: "card-1",
          currency: "USD",
          type: "INCOME",
          value: 2000,
        }),
        row(4, {
          creditCardId: "card-1",
          currency: "USD",
          type: "EXPENSE",
          value: 8715,
        }),
      ],
      NO_ISSUES,
      {},
    );
    const [, card] = reviewGroups(rows, records);
    const group = card.groups[0];

    expect(group.income.map((total) => total.currency)).toEqual(["BRL", "USD"]);
    expect(group.expenses).toEqual([{ cents: 8715, currency: "USD" }]);
    expect(card.income.map((total) => total.currency)).toEqual(["BRL", "USD"]);
  });

  it("SHOULD use the record currency WHEN the row has none", () => {
    const rows = reviewRows(
      [
        row(2, {
          categoryId: REFUND,
          creditCardId: "card-2",
          type: "INCOME",
          value: 2000,
        }),
      ],
      NO_ISSUES,
      {},
    );

    expect(reviewGroups(rows, records)[1].groups[0].income).toEqual([
      { cents: 2000, currency: "USD" },
    ]);
    expect(reviewGroups([], records)).toEqual([
      {
        block: "account",
        expenses: [],
        groups: [],
        income: [],
        selected: 0,
        total: 0,
      },
      {
        block: "card",
        expenses: [],
        groups: [],
        income: [],
        selected: 0,
        total: 0,
      },
    ]);
  });

  it("SHOULD name the checked lines WHEN the selection changes", () => {
    const first = reviewRows(built, validation, {});
    const changed = reviewRows(built, validation, { 2: false, 3: true });

    expect(selectionKey(changed)).toBe("3,4,5");
    expect(
      selectionKey(reviewRows(built, validation, { 3: false, 6: false })),
    ).toBe(selectionKey(first));
  });

  it("SHOULD total income and expenses per currency", () => {
    const rows = reviewRows(
      [row(2, { accountId: "a1", type: "EXPENSE", value: 1000 })],
      NO_ISSUES,
      {},
    );

    expect(currencyTotals(rows, records)).toEqual({
      BRL: { expenses: 1000, income: 0 },
    });
  });
});

describe("bulkSelection (spec 054)", () => {
  function reviewRow(line: number, overrides = {}) {
    return {
      checked: false,
      display,
      duplicate: true,
      line,
      locked: false,
      ...overrides,
    };
  }

  it("SHOULD list the rows without error and count the unchecked ones", () => {
    const result = bulkSelection([
      reviewRow(2),
      reviewRow(3, { checked: true }),
      reviewRow(4, { checked: true, errorCode: "INVALID_DATE", locked: true }),
    ]);

    expect(result).toEqual({
      allChecked: false,
      lines: [2, 3],
      uncheckedCount: 1,
    });
  });

  it("SHOULD report all checked and ignore error rows WHEN every other row is checked", () => {
    const result = bulkSelection([
      reviewRow(2, { checked: true }),
      reviewRow(4, { errorCode: "INVALID_DATE", locked: true }),
    ]);

    expect(result.allChecked).toBe(true);
    expect(result.lines).toEqual([2]);
  });

  it("SHOULD have nothing to toggle WHEN every row has an error", () => {
    const result = bulkSelection([
      reviewRow(4, { errorCode: "INVALID_DATE", locked: true }),
    ]);

    expect(result).toEqual({ allChecked: false, lines: [], uncheckedCount: 0 });
  });
});
