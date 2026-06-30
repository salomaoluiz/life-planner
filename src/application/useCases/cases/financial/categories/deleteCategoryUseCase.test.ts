import { mocks, setup, spies } from "./mocks/deleteCategoryUseCase.mocks";

it("SHOULD call repository deleteCategory correctly", async () => {
  await setup();
  expect(
    spies.financialRepositoryCategory.deleteCategory,
  ).toHaveBeenCalledTimes(1);
  expect(spies.financialRepositoryCategory.deleteCategory).toHaveBeenCalledWith(
    {
      id: mocks.defaultParams.id,
      ownerId: mocks.defaultParams.ownerId,
    },
  );
});
