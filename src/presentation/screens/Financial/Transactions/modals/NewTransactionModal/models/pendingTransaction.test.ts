import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";

import { buildDeleteTarget, buildPendingRow } from "./pendingTransaction";
import { createInitialState } from "./transactionFormState";

const owner = { id: "owner-1", type: "USER" } as OwnerDTO;
const base = createInitialState({
  accounts: [],
  now: new Date(2026, 9, 30),
  ownerId: "owner-1",
});

it("SHOULD build an account row from the form", () => {
  const row = buildPendingRow({
    accountName: "Checking",
    categoryName: "Food",
    id: "pending-1",
    owner,
    state: {
      ...base,
      accountId: "acc-1",
      amountCents: 1250,
      categoryId: "cat-1",
      description: "  Lunch ",
      notes: " note ",
      tags: ["work"],
    },
  });

  expect(row).toMatchObject({
    accountId: "acc-1",
    accountName: "Checking",
    category: "Food",
    description: "Lunch",
    id: "pending-1",
    notes: "note",
    ownerId: "owner-1",
    value: "12.50",
  });
  expect(row.creditCardId).toBeUndefined();
  expect(row.tags).toEqual([{ id: "work", name: "work" }]);
});

it("SHOULD build a card purchase row with its invoice month and no account", () => {
  const row = buildPendingRow({
    categoryName: "Food",
    id: "pending-2",
    invoiceMonth: "2026-11",
    owner,
    state: {
      ...base,
      accountId: "acc-1",
      amountCents: 500,
      categoryId: "cat-1",
      creditCardId: "card-1",
      description: "Coffee",
      payWith: "CARD",
    },
  });

  expect(row.creditCardId).toBe("card-1");
  expect(row.invoiceMonth).toBe("2026-11");
  expect(row.accountId).toBeUndefined();
});

describe("buildDeleteTarget", () => {
  const stored = new TransactionDTO({
    category: "Food",
    categoryId: "cat-1",
    date: new Date(2026, 9, 10).toISOString(),
    description: "Rent",
    id: "tx-1",
    occurrenceNumber: 3,
    owner: "USER",
    ownerId: "owner-1",
    recurrenceId: "rec-1",
    type: "EXPENSE",
    value: "10.00",
  });

  it("SHOULD target the scope of a recurrence occurrence", () => {
    expect(buildDeleteTarget(stored, "THIS_AND_NEXT")).toEqual({
      fromOccurrence: 3,
      recurrenceId: "rec-1",
      scope: "THIS_AND_NEXT",
      transactionId: "tx-1",
    });
  });

  it("SHOULD target just the row of a single transaction", () => {
    expect(
      buildDeleteTarget(
        new TransactionDTO({ ...stored, recurrenceId: undefined }),
      ),
    ).toEqual({ transactionId: "tx-1" });
  });
});
