import {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";

import { mocks, setup, spies } from "./mocks/transactionRepositoryImpl.mocks";

it("SHOULD call createTransaction correctly", async () => {
  const { createTransaction } = setup();

  const params = {
    category: "Some Category",
    date: new Date().toISOString(),
    description: "Some Description",
    owner: TransactionOwners.FAMILY,
    ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
    type: TransactionType.EXPENSE,
    value: "100.0",
  };

  const transaction = await createTransaction(params);

  expect(spies.createTransaction).toHaveBeenCalledTimes(1);
  expect(spies.createTransaction).toHaveBeenCalledWith(
    params,
    mocks.datasources,
  );
  expect(transaction).toEqual("createTransaction response");
});

it("SHOULD call deleteTransaction correctly", async () => {
  const { deleteTransaction } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    ownerId: "6eff80a7-e5e2-499d-9e47-5a448a753a03",
  };

  await deleteTransaction(params);

  expect(spies.deleteTransaction).toHaveBeenCalledTimes(1);
  expect(spies.deleteTransaction).toHaveBeenCalledWith(
    params,
    mocks.datasources,
  );
});

it("SHOULD call getTransactions correctly", async () => {
  const { getTransactions } = setup();

  const ownerIds = ["bb3443d4-a9bd-401e-9732-d6bf0dca7e83"];

  const transactions = await getTransactions(ownerIds);

  expect(spies.getTransactions).toHaveBeenCalledTimes(1);
  expect(spies.getTransactions).toHaveBeenCalledWith(
    ownerIds,
    mocks.datasources,
  );
  expect(transactions).toEqual("getTransactions response");
});

it("SHOULD call updateTransaction correctly", async () => {
  const { updateTransaction } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    ownerId: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
  };

  await updateTransaction(params);

  expect(spies.updateTransaction).toHaveBeenCalledTimes(1);
  expect(spies.updateTransaction).toHaveBeenCalledWith(
    params,
    mocks.datasources,
  );
});
