import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { makeInvoice } from "../mocks/invoice.mocks";
import { favoriteMonthSummary } from "./favoriteMonthSummary";
import TransactionUIModel from "./TransactionUIModel";

function row(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]> = {},
) {
  return new TransactionUIModel(
    new TransactionDTO({
      accountId: "fav",
      accountName: "Checking",
      category: "Food",
      categoryId: "cat-1",
      categoryName: "Food",
      date: new Date(2026, 10, 5).toISOString(),
      description: "Row",
      id: "tx",
      owner: "USER",
      ownerId: "user-id",
      type: "EXPENSE",
      value: "30.00",
      ...overrides,
    }),
  );
}

const NO_PROJECTIONS = { accountItems: [], cardGroups: [] };
const NO_CARDS = new Map<string, string>();

function summary(
  parts: Partial<Parameters<typeof favoriteMonthSummary>[0]> = {},
) {
  return favoriteMonthSummary({
    favoriteId: "fav",
    invoices: [],
    items: [],
    paymentAccountByCardId: NO_CARDS,
    projections: NO_PROJECTIONS,
    ...parts,
  });
}

describe("account rows", () => {
  it("SHOULD sum income and expenses and the unpaid part of each", () => {
    const result = summary({
      items: [
        row({ id: "a", paid: true, type: "INCOME", value: "100.00" }),
        row({ id: "b", paid: false, type: "INCOME", value: "40.00" }),
        row({ id: "c", paid: false, type: "EXPENSE", value: "30.00" }),
        row({ id: "d", paid: true, type: "EXPENSE", value: "10.00" }),
      ],
    });

    expect(result).toMatchObject({
      balanceCents: 10000 + 4000 - 3000 - 1000,
      expenseCents: 4000,
      incomeCents: 14000,
      toPayCents: 3000,
      toReceiveCents: 4000,
    });
  });

  it("SHOULD ignore other accounts, card purchases and balance adjustments", () => {
    const result = summary({
      items: [
        row({ accountId: "other" }),
        row({ creditCardId: "card-1" }),
        row({ systemKey: "BALANCE_ADJUSTMENT" }),
      ],
    });

    expect(result.expenseCents).toBe(0);
    expect(result.incomeCents).toBe(0);
  });
});

describe("invoices", () => {
  it("SHOULD count an open invoice of a card the favorite pays as expense and to pay", () => {
    const result = summary({
      invoices: [makeInvoice()],
      paymentAccountByCardId: new Map([["card-1", "fav"]]),
    });

    expect(result.expenseCents).toBe(45000);
    expect(result.toPayCents).toBe(45000);
  });

  it("SHOULD count a paid invoice by the account it was paid from, not as to pay", () => {
    const result = summary({
      invoices: [
        makeInvoice({
          payment: {
            accountId: "fav",
            amount: 45000,
            method: "ACCOUNT",
            paidOn: "2026-11-05",
          },
          status: "PAID",
        }),
      ],
      paymentAccountByCardId: new Map([["card-1", "other"]]),
    });

    expect(result.expenseCents).toBe(45000);
    expect(result.toPayCents).toBe(0);
  });

  it("SHOULD ignore invoices paid by another account or outside the app", () => {
    const result = summary({
      invoices: [
        makeInvoice(),
        makeInvoice({
          payment: { amount: 45000, method: "EXTERNAL", paidOn: "2026-11-05" },
        }),
      ],
      paymentAccountByCardId: new Map([["card-1", "other"]]),
    });

    expect(result.expenseCents).toBe(0);
  });
});

it("SHOULD put the projected occurrences of the favorite on the projected pair only", () => {
  const result = summary({
    projections: {
      accountItems: [
        row({ isProjected: true, type: "INCOME", value: "50.00" }),
        row({ isProjected: true, type: "EXPENSE", value: "20.00" }),
        row({ accountId: "other", isProjected: true, value: "99.00" }),
      ],
      cardGroups: [],
    },
  });

  expect(result.projectedIncomeCents).toBe(5000);
  expect(result.projectedExpenseCents).toBe(2000);
  expect(result.incomeCents).toBe(0);
});
