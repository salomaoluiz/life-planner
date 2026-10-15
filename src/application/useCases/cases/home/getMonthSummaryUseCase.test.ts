import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import { BusinessError } from "@domain/entities/errors";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getMonthSummaryUseCase.mocks";

const { transaction } = mocks;
const getTransactions = spies.transactionRepository.getTransactions;

it("SHOULD read the transactions of the selected owners only", async () => {
  await setup();

  expect(getTransactions).toHaveBeenCalledTimes(1);
  expect(getTransactions).toHaveBeenCalledWith(mocks.defaultParams.ownerIds);
});

it("SHOULD return zeros WHEN the month has no transactions", async () => {
  const result = await setup();

  expect(result).toBeInstanceOf(MonthSummaryDTO);
  expect(result).toEqual({ balance: 0, expense: 0, income: 0 });
});

it("SHOULD sum only income", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 2), "100.00", TransactionType.INCOME),
    transaction(new Date(2026, 9, 3), "50.50", TransactionType.INCOME),
  ]);

  expect(await setup()).toEqual({ balance: 15050, expense: 0, income: 15050 });
});

it("SHOULD sum only expenses AND return a negative balance", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 2), "10.00", TransactionType.EXPENSE),
    transaction(new Date(2026, 9, 3), "0.05", TransactionType.EXPENSE),
  ]);

  expect(await setup()).toEqual({ balance: -1005, expense: 1005, income: 0 });
});

it("SHOULD give the exact cents WHEN decimals are not representable (spec example)", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 1), "6500.00", TransactionType.INCOME),
    transaction(new Date(2026, 9, 10), "312.90", TransactionType.EXPENSE),
    transaction(new Date(2026, 9, 11), "48.70", TransactionType.EXPENSE),
  ]);

  expect(await setup()).toEqual({
    balance: 613840,
    expense: 36160,
    income: 650000,
  });
});

it("SHOULD count the first and the last day of the month", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 1), "1.00", TransactionType.INCOME),
    transaction(new Date(2026, 9, 31), "2.00", TransactionType.INCOME),
  ]);

  expect((await setup()).income).toBe(300);
});

it("SHOULD ignore the day before and the day after the month", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 8, 30), "1.00", TransactionType.INCOME),
    transaction(new Date(2026, 10, 1), "2.00", TransactionType.EXPENSE),
  ]);

  expect(await setup()).toEqual({ balance: 0, expense: 0, income: 0 });
});

it("SHOULD ignore the same month of another year", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2025, 9, 15), "1.00", TransactionType.INCOME),
  ]);

  expect((await setup()).income).toBe(0);
});

it("SHOULD rethrow an unknown error untouched", async () => {
  getTransactions.mockRejectedValueOnce(mocks.errors.unknown);

  expect(await setupThrowable()).toBe(mocks.errors.unknown);
});

it("SHOULD add the use case to the context of a business error", async () => {
  getTransactions.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "home.getMonthSummaryUseCase",
  });
});

it("SHOULD skip transactions excluded from totals (balance adjustments)", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 2), "100.00", TransactionType.INCOME),
    new TransactionEntityFixture()
      .withDefault()
      .withBalanceAdjustment()
      .withOwnerId(mocks.defaultParams.ownerIds[0])
      .withDate(new Date(2026, 9, 3))
      .withType(TransactionType.INCOME)
      .withValue("999.00")
      .build(),
    new TransactionEntityFixture()
      .withDefault()
      .withBalanceAdjustment()
      .withOwnerId(mocks.defaultParams.ownerIds[0])
      .withDate(new Date(2026, 9, 4))
      .withType(TransactionType.EXPENSE)
      .withValue("500.00")
      .build(),
  ]);

  expect(await setup()).toEqual({ balance: 10000, expense: 0, income: 10000 });
});

it("SHOULD sum only the transactions of the requested owners (the repository returns every cached owner)", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 2), "100.00", TransactionType.INCOME),
    new TransactionEntityFixture()
      .withDefault()
      .withOwnerId("someone-else")
      .withDate(new Date(2026, 9, 3))
      .withType(TransactionType.INCOME)
      .withValue("900.00")
      .build(),
  ]);

  expect(await setup()).toEqual({ balance: 10000, expense: 0, income: 10000 });
});

describe("card invoices (spec 029 FR 25)", () => {
  const getInvoices = spies.creditCardRepository.getCardInvoicesForMonth;

  function invoiceOf(ownerId: string, amount: number) {
    return {
      card: { ownerId },
      invoice: { amount },
    } as never;
  }

  it("SHOULD ask for the invoices of the selected month and owners", async () => {
    await setup();

    expect(getInvoices).toHaveBeenCalledWith({
      month: "2026-10",
      ownerIds: mocks.defaultParams.ownerIds,
    });
  });

  it("SHOULD add the amount of the month's invoices to the expenses", async () => {
    getTransactions.mockResolvedValueOnce([
      transaction(new Date(2026, 9, 2), "10.00", TransactionType.EXPENSE),
    ]);
    getInvoices.mockResolvedValueOnce([
      invoiceOf(mocks.defaultParams.ownerIds[0], 45000),
      invoiceOf("someone-else", 99999),
    ]);

    expect(await setup()).toEqual({
      balance: -46000,
      expense: 46000,
      income: 0,
    });
  });

  it("SHOULD NOT count card purchases in the month they were bought", async () => {
    getTransactions.mockResolvedValueOnce([
      new TransactionEntityFixture()
        .withDefault()
        .withOwnerId(mocks.defaultParams.ownerIds[0])
        .withCard("card-1", "2026-10")
        .withDate(new Date(2026, 9, 2))
        .withValue("250.00")
        .build(),
    ]);

    expect(await setup()).toEqual({ balance: 0, expense: 0, income: 0 });
  });

  it("SHOULD rethrow a failing invoices request", async () => {
    getInvoices.mockRejectedValueOnce(mocks.errors.unknown);

    expect(await setupThrowable()).toBe(mocks.errors.unknown);
  });
});
