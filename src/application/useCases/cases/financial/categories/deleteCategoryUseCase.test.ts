import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteCategoryUseCase.mocks";

const deleteCategorySpy = spies.financialRepositoryCategory.deleteCategory;

it("SHOULD delete a transaction", () => {
  setup();

  expect(deleteCategorySpy).toHaveBeenCalledTimes(1);
  expect(deleteCategorySpy).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    ownerId: mocks.defaultParams.ownerId,
  });
});

it("SHOULD throw if the repository throws", async () => {
  deleteCategorySpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  deleteCategorySpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.deleteCategoryUseCase",
  });
});
