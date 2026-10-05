import {
  ApiBusinessError,
  CategoryHasTransactions,
  ConnectivityError,
  FinancialNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteCategory.mocks";

it("SHOULD DELETE /v1/finance/categories/:id (204, the API also deletes the subcategories)", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.delete).toHaveBeenCalledWith(
    `/v1/finance/categories/${mocks.params.id}`,
  );
});

it("SHOULD throw CategoryHasTransactions WHEN the API answers 409", async () => {
  spies.delete.mockRejectedValueOnce(
    new ApiBusinessError("Category has transactions", 409),
  );

  expect(await setupThrowable()).toBeInstanceOf(CategoryHasTransactions);
});

it("SHOULD throw FinancialNotFound WHEN the API answers 404", async () => {
  spies.delete.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD re-throw other business errors", async () => {
  const error = new ConnectivityError();
  spies.delete.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the category id only", async () => {
  spies.delete.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "CategoryDatasource - deleteCategory",
    error: expect.any(Error),
    id: mocks.params.id,
  });
});
