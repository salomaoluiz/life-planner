import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getFinanceMonthUseCase.mocks";

const getMonthSpy = spies.financialRepositoryTransaction.getFinanceMonth;
const getCategoriesSpy = spies.financialRepositoryCategory.getCategories;
const getAccountsSpy = spies.financialRepositoryAccount.getAccounts;

it("SHOULD return the month with the rows as DTOs named after their category and account", async () => {
  getMonthSpy.mockResolvedValueOnce(mocks.month);
  getCategoriesSpy.mockResolvedValueOnce(mocks.categories);
  getAccountsSpy.mockResolvedValueOnce(mocks.accounts);

  const result = await setup();

  expect(getMonthSpy).toHaveBeenCalledWith(mocks.params);
  expect(getCategoriesSpy).toHaveBeenCalledWith(mocks.params.ownerIds);
  expect(getAccountsSpy).toHaveBeenCalledWith(mocks.params.ownerIds);
  expect(result.items).toEqual([
    TransactionDTO.fromEntity(mocks.transaction, "Shopping", "Main Account"),
  ]);
  expect(result.summary).toEqual(mocks.month.summary);
  expect(result.dailyBalances.month).toBe("2026-11");
  expect(result.invoices).toEqual([]);
  expect(result.projections).toEqual([]);
});

it("SHOULD add the use case to the context of a DefaultError AND re-throw it", async () => {
  const error = new BusinessError();

  getMonthSpy.mockRejectedValueOnce(error);
  getCategoriesSpy.mockResolvedValueOnce([]);
  getAccountsSpy.mockResolvedValueOnce([]);

  expect(await setupThrowable()).toBe(error);
  expect(error).toHaveProperty("context", {
    useCase: "financial.getFinanceMonthUseCase",
  });
});

it("SHOULD re-throw unknown errors", async () => {
  const error = new Error("boom");

  getMonthSpy.mockRejectedValueOnce(error);
  getCategoriesSpy.mockResolvedValueOnce([]);
  getAccountsSpy.mockResolvedValueOnce([]);

  expect(await setupThrowable()).toBe(error);
});
