import { InvoiceIsPaid } from "@domain/entities/errors";
import { invalidateFetcherData } from "@infrastructure/fetcher";

import { getChanges, getFailures, resetPending } from "./pendingChanges";
import runPendingChange from "./runPendingChange";

jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn(),
}));
jest.mock("@application/useCases", () => {
  function uc(name: string) {
    return { uniqueName: name };
  }

  return {
    useCases: {
      getFinancialCardInvoicesForMonthUseCase: uc("invoices"),
      getFinancialDailyBalancesUseCase: uc("balances"),
      getFinancialFilteredTransactionsUseCase: uc("filtered"),
      getFinancialProjectionsUseCase: uc("projections"),
      getFinancialTransactionsUseCase: uc("transactions"),
      getMonthSummaryUseCase: uc("summary"),
    },
  };
});

const invalidate = invalidateFetcherData as jest.Mock;
const base = { description: "Lunch", kind: "create" as const };

beforeEach(() => {
  resetPending();
  invalidate.mockReset();
  invalidate.mockResolvedValue(undefined);
});

it("SHOULD keep the change registered until the lists refetched", async () => {
  const finishers: (() => void)[] = [];

  invalidate.mockImplementation(
    async () => new Promise<void>((resolve) => finishers.push(resolve)),
  );
  let during: number | undefined;
  const run = runPendingChange(
    base,
    async () => {
      during = getChanges().length;
    },
    jest.fn(),
  );

  await Promise.resolve();
  await Promise.resolve();
  expect(during).toBe(1);
  expect(getChanges()).toHaveLength(1);
  finishers.forEach((finish) => finish());
  await run;
  expect(getChanges()).toHaveLength(0);
  expect(getFailures()).toHaveLength(0);
  expect(invalidate).toHaveBeenCalledWith(["transactions"]);
  expect(invalidate).toHaveBeenCalledWith(["summary"]);
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
