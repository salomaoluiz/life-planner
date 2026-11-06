import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { InvoiceIsPaid } from "@domain/entities/errors";
import {
  invalidateFetcherData,
  updateCachedFetcherData,
} from "@infrastructure/fetcher";

import { getChanges, getFailures, resetPending } from "./pendingChanges";
import runPendingChange from "./runPendingChange";

jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn(),
  markFetcherDataStale: jest.fn(),
  updateCachedFetcherData: jest.fn(),
}));

const invalidate = invalidateFetcherData as jest.Mock;
const patch = updateCachedFetcherData as jest.Mock;
const base = { description: "Lunch", kind: "create" as const };

function dto(overrides: Partial<TransactionDTO> = {}) {
  return new TransactionDTO({
    accountId: "account-1",
    category: "Food",
    categoryId: "category-1",
    date: "2026-10-10T12:00:00",
    description: "Lunch",
    id: "t1",
    owner: "USER",
    ownerId: "owner-1",
    type: "EXPENSE",
    value: "10.00",
    ...overrides,
  });
}

function invalidated() {
  return invalidate.mock.calls.map(([key]) => key.join("/"));
}

function wasInvalidated(key: string[]) {
  return invalidated().includes(key.join("/"));
}

beforeEach(() => {
  resetPending();
  invalidate.mockReset();
  invalidate.mockResolvedValue(undefined);
  patch.mockReset();
});

it("SHOULD patch the lists and clear the change BEFORE the refreshes land", async () => {
  const finishers: (() => void)[] = [];

  invalidate.mockImplementation(
    async () => new Promise<void>((resolve) => finishers.push(resolve)),
  );
  let during: number | undefined;
  const run = runPendingChange(
    { ...base, row: dto({ id: "pending-1" }) },
    async () => {
      during = getChanges().length;

      return { id: "real-1" };
    },
    jest.fn(),
  );

  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(during).toBe(1);
  expect(patch).toHaveBeenCalledWith(
    financeKeys.transactions.list(),
    expect.any(Function),
  );
  expect(getChanges()).toHaveLength(0);
  finishers.forEach((finish) => finish());
  await run;
  expect(getFailures()).toHaveLength(0);
});

it("SHOULD refresh only the month's entry (rows patched, totals refetched), the accounts and the cards after a plain create", async () => {
  await runPendingChange(
    { ...base, row: dto({ id: "pending-1" }) },
    async () => ({ id: "real-1" }),
    jest.fn(),
  );

  expect(wasInvalidated(financeKeys.transactions.list("2026-10"))).toBe(true);
  expect(wasInvalidated(financeKeys.transactions.list("2026-09"))).toBe(false);
  expect(wasInvalidated(financeKeys.projections.all())).toBe(false);
  expect(wasInvalidated(financeKeys.summary.monthPrefix("2026-10"))).toBe(true);
  expect(wasInvalidated(financeKeys.dailyBalances.monthPrefix("2026-10"))).toBe(
    true,
  );
  expect(wasInvalidated(financeKeys.accounts.all())).toBe(true);
  expect(wasInvalidated(financeKeys.creditCards.all())).toBe(true);
});

it("SHOULD drop a deleted row from memory AND refresh the month's totals", async () => {
  await runPendingChange(
    {
      description: "Lunch",
      kind: "delete",
      previous: dto(),
      target: { transactionId: "t1" },
    },
    async () => undefined,
    jest.fn(),
  );

  expect(patch).toHaveBeenCalledTimes(1);
  expect(wasInvalidated(financeKeys.transactions.list("2026-10"))).toBe(true);
  expect(wasInvalidated(financeKeys.summary.monthPrefix("2026-10"))).toBe(true);
});

it("SHOULD refetch the lists and the projections WHEN the row has a recurrence", async () => {
  await runPendingChange(
    {
      description: "Rent",
      kind: "edit",
      previous: dto({ recurrenceId: "r1" }),
      row: dto({ recurrenceId: "r1" }),
    },
    async () => undefined,
    jest.fn(),
  );

  expect(patch).not.toHaveBeenCalled();
  expect(wasInvalidated(financeKeys.transactions.list())).toBe(true);
  expect(wasInvalidated(financeKeys.projections.all())).toBe(true);
});

it("SHOULD refresh the invoice month, not the account month, of a card purchase", async () => {
  await runPendingChange(
    {
      ...base,
      row: dto({
        accountId: undefined,
        creditCardId: "card-1",
        invoiceMonth: "2026-11",
      }),
    },
    async () => ({ id: "real-1" }),
    jest.fn(),
  );

  expect(patch).not.toHaveBeenCalled();
  expect(wasInvalidated(financeKeys.invoices.list("2026-11"))).toBe(true);
  expect(wasInvalidated(financeKeys.transactions.list("2026-10"))).toBe(false);
  expect(wasInvalidated(financeKeys.projections.all())).toBe(false);
});

it("SHOULD roll back and queue one failure with retry on error", async () => {
  const retry = jest.fn();

  await runPendingChange(
    base,
    async () => Promise.reject(new Error("x")),
    retry,
  );
  expect(getChanges()).toHaveLength(0);
  expect(getFailures()).toHaveLength(1);
  expect(patch).not.toHaveBeenCalled();
  expect(invalidate).toHaveBeenCalledWith(financeKeys.transactions.all());
  expect(getFailures()[0].messageKey).toBeUndefined();
  getFailures()[0].retry();
  expect(retry).toHaveBeenCalledTimes(1);
});

it("SHOULD keep the copy key of a business error", async () => {
  await runPendingChange(
    base,
    async () => Promise.reject(new InvoiceIsPaid()),
    jest.fn(),
  );
  expect(getFailures()[0].messageKey).toBeDefined();
});

it("SHOULD carry the pay action of the change into its failure", async () => {
  await runPendingChange(
    { ...base, action: "pay" },
    async () => Promise.reject(new Error("x")),
    jest.fn(),
  );
  expect(getFailures()[0].action).toBe("pay");
});

it("SHOULD end with no change and one failure when one of two quick creates fails", async () => {
  await Promise.all([
    runPendingChange(
      { ...base, description: "Ok" },
      async () => undefined,
      jest.fn(),
    ),
    runPendingChange(
      { ...base, description: "Bad" },
      async () => Promise.reject(new Error("x")),
      jest.fn(),
    ),
  ]);
  expect(getChanges()).toHaveLength(0);
  expect(getFailures().map((failure) => failure.description)).toEqual(["Bad"]);
});
