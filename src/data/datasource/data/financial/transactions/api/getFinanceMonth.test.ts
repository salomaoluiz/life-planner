import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getFinanceMonth.mocks";

it("SHOULD GET /v1/finance/month with the owners, today and the month AND join the parts", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiResponse);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/month?ownerId=${mocks.ownerId}&today=${todayCalendarDate()}&month=2026-11`,
  );
  expect(result.transactions).toHaveLength(1);
  expect(result.transactions[0]).toMatchObject({
    category: "Groceries",
    id: mocks.apiTransaction.id,
  });
  expect(result.summary).toEqual({
    currency: "BRL",
    expense: 23490,
    income: 0,
    projectedExpense: 0,
    projectedIncome: 0,
    toPay: 0,
    toReceive: 0,
  });
  expect(result.dailyBalances.month).toBe("2026-11");
  expect(spies.fetchTransactionPages).not.toHaveBeenCalled();
});

it("SHOULD follow the next cursor through the list endpoint WHEN the month has more than a page", async () => {
  const rest = [{ ...mocks.apiTransaction, id: "rest" }];

  spies.get.mockResolvedValueOnce({
    ...mocks.apiResponse,
    rows: { items: [mocks.apiTransaction], nextCursor: "cursor-1" },
  });
  spies.fetchTransactionPages.mockResolvedValueOnce(rest as never);

  const result = await setup();

  expect(spies.fetchTransactionPages).toHaveBeenCalledWith(
    `/v1/finance/transactions?ownerId=${mocks.ownerId}&today=${todayCalendarDate()}&from=2026-11-01&to=2026-11-30`,
    "cursor-1",
  );
  expect(result.transactions).toHaveLength(2);
  expect(result.nextCursor).toBeNull();
});

it("SHOULD answer an empty month WITHOUT a request WHEN there are no owners", async () => {
  const result = await setup([]);

  expect(spies.get).not.toHaveBeenCalled();
  expect(result.transactions).toEqual([]);
  expect(result.summary.income).toBe(0);
});

it("SHOULD wrap unknown errors in GenericError with the month", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - getFinanceMonth",
    error: expect.any(Error),
    month: "2026-11",
    ownerIds: [mocks.ownerId],
  });
});

it("SHOULD send the currency AND keep it on the follow-up pages (spec 103)", async () => {
  spies.get.mockResolvedValueOnce({
    ...mocks.apiResponse,
    rows: { items: [mocks.apiTransaction], nextCursor: "cursor-1" },
    summary: { ...mocks.apiResponse.summary, currency: "USD" },
  });
  spies.fetchTransactionPages.mockResolvedValueOnce([] as never);

  const result = await setup([mocks.ownerId], "USD");

  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/month?ownerId=${mocks.ownerId}&today=${todayCalendarDate()}&currency=USD&month=2026-11`,
  );
  expect(spies.fetchTransactionPages).toHaveBeenCalledWith(
    expect.stringContaining("&currency=USD&from=2026-11-01"),
    "cursor-1",
  );
  expect(result.summary.currency).toBe("USD");
});
