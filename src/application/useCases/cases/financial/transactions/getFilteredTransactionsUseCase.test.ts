import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import getFilteredTransactionsUseCase from "./getFilteredTransactionsUseCase";
import { mocks, spies } from "./mocks/getTransactionsUseCase.mocks";

const params = {
  filter: { categoryIds: ["c1"], q: "mercado" },
  ownerIds: mocks.defaultParams.ownerIds,
};

it("SHOULD ask the repository for the filtered rows and return the TransactionDTO with names", async () => {
  jest
    .mocked(repositoriesMocks.financialRepository.transaction)
    .getFilteredTransactions.mockResolvedValueOnce(mocks.transactionEntities);
  spies.financialRepositoryCategory.getCategories.mockResolvedValueOnce(
    mocks.categories,
  );
  spies.financialRepositoryAccount.getAccounts.mockResolvedValueOnce(
    mocks.accounts,
  );

  const result =
    await getFilteredTransactionsUseCase(repositoriesMocks).execute(params);

  expect(
    repositoriesMocks.financialRepository.transaction.getFilteredTransactions,
  ).toHaveBeenCalledWith(params);
  expect(result).toHaveLength(mocks.transactionEntities.length);
});

it("SHOULD add its context to a business error and rethrow", async () => {
  jest
    .mocked(repositoriesMocks.financialRepository.transaction)
    .getFilteredTransactions.mockRejectedValueOnce(mocks.errors.business);

  await expect(
    getFilteredTransactionsUseCase(repositoriesMocks).execute(params),
  ).rejects.toBeInstanceOf(BusinessError);
  expect(mocks.errors.business).toHaveProperty(
    "context.useCase",
    "financial.getFilteredTransactionsUseCase",
  );
});
