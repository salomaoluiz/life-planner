import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactionByIdUseCase.mocks";

const getByIdSpy = spies.financialRepositoryTransaction.getTransactionById;
const getCategoriesSpy = spies.financialRepositoryCategory.getCategories;
const getAccountsSpy = spies.financialRepositoryAccount.getAccounts;

it("SHOULD return the DTO of the row with its category and account names", async () => {
  getByIdSpy.mockResolvedValueOnce(mocks.transaction);
  getCategoriesSpy.mockResolvedValueOnce(mocks.categories);
  getAccountsSpy.mockResolvedValueOnce(mocks.accounts);

  const result = await setup();

  expect(getByIdSpy).toHaveBeenCalledWith(mocks.params.id);
  expect(getCategoriesSpy).toHaveBeenCalledWith(mocks.params.ownerIds);
  expect(getAccountsSpy).toHaveBeenCalledWith(mocks.params.ownerIds);
  expect(result).toEqual(
    TransactionDTO.fromEntity(
      mocks.transaction,
      mocks.categories.find((c) => c.id === mocks.transaction.categoryId)?.name,
      mocks.accounts.find((a) => a.id === mocks.transaction.accountId)?.name,
    ),
  );
});

it("SHOULD return undefined WHEN the row is missing or not readable", async () => {
  getByIdSpy.mockResolvedValueOnce(undefined);
  getCategoriesSpy.mockResolvedValueOnce(mocks.categories);
  getAccountsSpy.mockResolvedValueOnce(mocks.accounts);

  expect(await setup()).toBeUndefined();
});

it("SHOULD re-throw a business error with the use case context", async () => {
  const error = new BusinessError();

  getByIdSpy.mockRejectedValueOnce(error);

  const result = await setupThrowable();

  expect(result).toBe(error);
  expect(error).toHaveProperty("context", {
    useCase: "financial.getTransactionByIdUseCase",
  });
});

it("SHOULD re-throw unknown errors", async () => {
  getByIdSpy.mockRejectedValueOnce(new Error("boom"));

  expect(await setupThrowable()).toHaveProperty("message", "boom");
});
