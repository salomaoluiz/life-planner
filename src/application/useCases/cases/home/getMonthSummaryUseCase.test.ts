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
  expect(result).toEqual({
    balance: 0,
    expense: 0,
    income: 0,
    projectedExpense: 0,
    projectedIncome: 0,
    toPay: 0,
    toReceive: 0,
  });
});

it("SHOULD sum only income", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 2), "100.00", TransactionType.INCOME),
    transaction(new Date(2026, 9, 3), "50.50", TransactionType.INCOME),
  ]);

  expect(await setup()).toMatchObject({
    balance: 15050,
    expense: 0,
    income: 15050,
  });
});

it("SHOULD sum only expenses AND return a negative balance", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 2), "10.00", TransactionType.EXPENSE),
    transaction(new Date(2026, 9, 3), "0.05", TransactionType.EXPENSE),
  ]);

  expect(await setup()).toMatchObject({
    balance: -1005,
    expense: 1005,
    income: 0,
  });
});

it("SHOULD give the exact cents WHEN decimals are not representable (spec example)", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction(new Date(2026, 9, 1), "6500.00", TransactionType.INCOME),
    transaction(new Date(2026, 9, 10), "312.90", TransactionType.EXPENSE),
    transaction(new Date(2026, 9, 11), "48.70", TransactionType.EXPENSE),
  ]);

  expect(await setup()).toMatchObject({
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

  expect(await setup()).toMatchObject({ balance: 0, expense: 0, income: 0 });
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

  expect(await setup()).toMatchObject({
    balance: 10000,
    expense: 0,
    income: 10000,
  });
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

  expect(await setup()).toMatchObject({
    balance: 10000,
    expense: 0,
    income: 10000,
  });
});

describe("card invoices (spec 029 FR 25)", () => {
  const getInvoices = spies.creditCardRepository.getCardInvoicesForMonth;

  function invoiceOf(
    ownerId: string,
    amount: number,
    earlyPaid = 0,
    extra: Record<string, unknown> = {},
  ) {
    return {
      card: { ownerId },
      invoice: {
        amount,
        amountDue: amount,
        earlyPaid,
        status: "CLOSED",
        ...extra,
      },
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

    expect(await setup()).toMatchObject({
      balance: -46000,
      expense: 46000,
      income: 0,
    });
  });

  it("SHOULD add what was paid early to what is still due (spec 032 FR 9)", async () => {
    getInvoices.mockResolvedValueOnce([
      invoiceOf(mocks.defaultParams.ownerIds[0], 40000, 60000),
    ]);

    expect(await setup()).toMatchObject({
      balance: -100000,
      expense: 100000,
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

    expect(await setup()).toMatchObject({ balance: 0, expense: 0, income: 0 });
  });

  it("SHOULD rethrow a failing invoices request", async () => {
    getInvoices.mockRejectedValueOnce(mocks.errors.unknown);

    expect(await setupThrowable()).toBe(mocks.errors.unknown);
  });
});

describe("to pay and to receive (spec 033 FR 16)", () => {
  const getInvoices = spies.creditCardRepository.getCardInvoicesForMonth;

  function invoiceOf(
    ownerId: string,
    amount: number,
    earlyPaid = 0,
    extra: Record<string, unknown> = {},
  ) {
    return {
      card: { ownerId },
      invoice: {
        amount,
        amountDue: amount,
        earlyPaid,
        status: "CLOSED",
        ...extra,
      },
    } as never;
  }

  function row(
    date: Date,
    value: string,
    type: TransactionType,
    paid: boolean,
  ) {
    const entity = transaction(date, value, type);
    entity.paid = paid;

    return entity;
  }

  it("SHOULD sum the unpaid expenses and incomes of the month apart, whatever their date inside it", async () => {
    getTransactions.mockResolvedValueOnce([
      row(new Date(2026, 9, 2), "10.00", TransactionType.EXPENSE, false),
      row(new Date(2026, 9, 28), "5.50", TransactionType.EXPENSE, false),
      row(new Date(2026, 9, 3), "7.00", TransactionType.EXPENSE, true),
      row(new Date(2026, 9, 4), "100.00", TransactionType.INCOME, false),
      row(new Date(2026, 9, 5), "40.00", TransactionType.INCOME, true),
    ]);

    expect(await setup()).toMatchObject({
      expense: 2250,
      income: 14000,
      toPay: 1550,
      toReceive: 10000,
    });
  });

  it("SHOULD leave unpaid rows of other months out", async () => {
    getTransactions.mockResolvedValueOnce([
      row(new Date(2026, 8, 20), "10.00", TransactionType.EXPENSE, false),
      row(new Date(2026, 10, 1), "10.00", TransactionType.INCOME, false),
    ]);

    expect(await setup()).toMatchObject({ toPay: 0, toReceive: 0 });
  });

  it("SHOULD add the amount due of an unpaid invoice AND nothing for a paid one", async () => {
    getInvoices.mockResolvedValueOnce([
      invoiceOf(mocks.defaultParams.ownerIds[0], 40000, 60000),
      invoiceOf(mocks.defaultParams.ownerIds[0], 0, 0, { status: "PAID" }),
      invoiceOf(mocks.defaultParams.ownerIds[0], 5000, 0, { status: "PAID" }),
    ]);

    expect(await setup()).toMatchObject({ toPay: 40000 });
  });
});

describe("projected occurrences (spec 034 FR 15)", () => {
  const november = new Date(2026, 10, 10);
  const owner = mocks.defaultParams.ownerIds[0];

  function projected(overrides: Record<string, unknown>) {
    return {
      creditCardId: undefined,
      date: new Date(2026, 10, 5).toISOString(),
      invoiceListDate: undefined,
      ownerId: owner,
      type: TransactionType.EXPENSE,
      value: "100.00",
      ...overrides,
    } as never;
  }

  it("SHOULD NOT ask for projections in the current or a past month", async () => {
    await setup();
    await setup({ ...mocks.defaultParams, month: new Date(2026, 7, 1) });

    expect(spies.recurrenceRepository.getProjections).not.toHaveBeenCalled();
  });

  it("SHOULD ask for the projections of the next months, looking two months back for card invoices", async () => {
    await setup({ ...mocks.defaultParams, month: new Date(2027, 2, 10) });

    expect(spies.recurrenceRepository.getProjections).toHaveBeenCalledWith({
      from: "2027-01",
      ownerIds: mocks.defaultParams.ownerIds,
      to: "2027-03",
    });
  });

  it("SHOULD never ask before the month after the current one", async () => {
    await setup({ ...mocks.defaultParams, month: november });

    expect(spies.recurrenceRepository.getProjections).toHaveBeenCalledWith(
      expect.objectContaining({ from: "2026-11", to: "2026-11" }),
    );
  });

  it("SHOULD add the account occurrences of the month apart from the real totals", async () => {
    spies.recurrenceRepository.getProjections.mockResolvedValueOnce([
      projected({ value: "200.00" }),
      projected({ type: TransactionType.INCOME, value: "50.00" }),
      projected({ date: new Date(2026, 11, 5).toISOString() }),
    ]);

    const result = await setup({ ...mocks.defaultParams, month: november });

    expect(result).toMatchObject({
      expense: 0,
      income: 0,
      projectedExpense: 20000,
      projectedIncome: 5000,
      toPay: 0,
      toReceive: 0,
    });
  });

  it("SHOULD add the card occurrences whose invoice appears in the month, whatever their own date", async () => {
    spies.recurrenceRepository.getProjections.mockResolvedValueOnce([
      projected({
        creditCardId: "card-1",
        date: new Date(2026, 9, 28).toISOString(),
        invoiceListDate: "2026-11-10",
      }),
      projected({
        creditCardId: "card-1",
        invoiceListDate: "2026-12-10",
      }),
      projected({ creditCardId: "card-1" }),
    ]);

    const result = await setup({ ...mocks.defaultParams, month: november });

    expect(result.projectedExpense).toBe(10000);
  });

  it("SHOULD ignore projections of owners that are not selected", async () => {
    spies.recurrenceRepository.getProjections.mockResolvedValueOnce([
      projected({ ownerId: "someone-else" }),
    ]);

    expect(
      (await setup({ ...mocks.defaultParams, month: november }))
        .projectedExpense,
    ).toBe(0);
  });

  it("SHOULD not ask WHEN there are no owners", async () => {
    await setup({ month: november, ownerIds: [] });

    expect(spies.recurrenceRepository.getProjections).not.toHaveBeenCalled();
  });
});
