import CategoryDTO from "@application/dto/financial/CategoryDTO";

import { mocks, setup, spies } from "./mocks/getCategoriesUseCase.mocks";

it("SHOULD call repository getCategories correctly", async () => {
  const result = await setup();
  expect(spies.financialRepositoryCategory.getCategories).toHaveBeenCalledTimes(
    1,
  );
  expect(spies.financialRepositoryCategory.getCategories).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(result[0]).toBeInstanceOf(CategoryDTO);
});
