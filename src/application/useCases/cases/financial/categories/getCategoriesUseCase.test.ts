import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import getCategoriesUseCase from "./getCategoriesUseCase";
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

describe("error handling", () => {
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.category.getCategories,
    );
  }

  it("SHOULD pass the owner ids to the repository", async () => {
    repository().mockResolvedValueOnce([]);

    const result = await getCategoriesUseCase(repositoriesMocks).execute([
      "user-id",
    ]);

    expect(repository()).toHaveBeenCalledWith(["user-id"]);
    expect(result).toEqual([]);
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      getCategoriesUseCase(repositoriesMocks).execute(["user-id"]),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.getCategoriesUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      getCategoriesUseCase(repositoriesMocks).execute(["user-id"]),
    ).rejects.toBe(error);
  });
});
