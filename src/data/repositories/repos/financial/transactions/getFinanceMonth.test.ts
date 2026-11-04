import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import FinanceMonthModel from "@data/models/financial/FinanceMonthModel";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getFinanceMonth from "./getFinanceMonth";

const read = jest.mocked(
  datasourcesMocks.financialTransactionDatasource.getFinanceMonth,
);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD read the month from the datasource AND map every part to entities", async () => {
  const model = FinanceMonthModel.empty("2026-11");

  model.transactions.push(
    new TransactionModel({
      accountId: "account-1",
      category: "Food",
      categoryId: "category-1",
      date: "2026-11-03T00:00:00.000Z",
      description: "Groceries",
      id: "transaction-1",
      owner: OwnerType.USER,
      ownerId: "owner-1",
      type: TransactionType.EXPENSE,
      value: "100.00",
    }),
  );
  model.summary.income = 500;
  read.mockResolvedValueOnce(model);

  const result = await getFinanceMonth(
    { month: "2026-11", ownerIds: ["owner-1"] },
    datasourcesMocks,
  );

  expect(read).toHaveBeenCalledWith({
    month: "2026-11",
    ownerIds: ["owner-1"],
  });
  expect(result.transactions).toHaveLength(1);
  expect(result.transactions[0]).toMatchObject({ id: "transaction-1" });
  expect(result.summary.income).toBe(500);
  expect(result.dailyBalances.month).toBe("2026-11");
  expect(result.invoices).toEqual([]);
  expect(result.projections).toEqual([]);
});
