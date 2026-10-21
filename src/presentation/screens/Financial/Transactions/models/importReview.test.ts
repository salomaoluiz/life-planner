import { BuiltRow } from "@application/csvImport/buildRows";

import {
  canImport,
  filterRows,
  importPayloads,
  invoiceLines,
  kindCounts,
  reviewRows,
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
