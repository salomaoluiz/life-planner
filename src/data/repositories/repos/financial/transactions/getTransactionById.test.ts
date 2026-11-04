import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getTransactionById from "./getTransactionById";

const getById = jest.mocked(
  datasourcesMocks.financialTransactionDatasource.getTransactionById,
);

const model = new TransactionModel({
  accountId: "account-1",
  category: "Food",
  categoryId: "category-1",
  date: "2026-10-03T00:00:00.000Z",
  description: "Groceries",
  id: "transaction-1",
  owner: OwnerType.USER,
  ownerId: "owner-1",
  type: TransactionType.EXPENSE,
  value: "100.00",
});

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD read the row from the datasource AND map it to an entity", async () => {
  getById.mockResolvedValueOnce(model);

  const result = await getTransactionById("transaction-1", datasourcesMocks);

  expect(getById).toHaveBeenCalledWith("transaction-1");
  expect(result).toMatchObject({
    categoryId: "category-1",
    id: "transaction-1",
    ownerId: "owner-1",
  });
});

it("SHOULD return undefined WHEN the datasource finds nothing", async () => {
  getById.mockResolvedValueOnce(undefined);

  expect(
    await getTransactionById("transaction-1", datasourcesMocks),
  ).toBeUndefined();
});
