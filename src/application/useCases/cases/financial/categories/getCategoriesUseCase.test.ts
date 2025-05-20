import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getCategoriesUseCase.mocks";

const getCategoriesSpy = spies.financialRepositoryCategory.getCategories;

it("SHOULD get all categories and return the CategoryDTO", async () => {
  getCategoriesSpy.mockResolvedValueOnce(mocks.categoryEntities);

  const result = await setup();

  expect(getCategoriesSpy).toHaveBeenCalledTimes(1);
  expect(getCategoriesSpy).toHaveBeenCalledWith(mocks.defaultParams.ownerIds);
  const expected = mocks.categoryEntities.map((category) =>
    CategoryDTO.fromEntity(category),
  );
  expect(result).toEqual(expected);
});

it("SHOULD throw if the repository throws", async () => {
  getCategoriesSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  getCategoriesSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.getCategoriesUseCase",
  });
});
