import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import deleteCategoryUseCase from "./deleteCategoryUseCase";
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

describe("error handling and arguments", () => {
  const params = { id: "cat-id", ownerId: "user-id" };
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.category.deleteCategory,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD call the repository with the mapped params", async () => {
    await deleteCategoryUseCase(repositoriesMocks).execute(params);

    expect(repository()).toHaveBeenCalledWith({
      id: "cat-id",
      ownerId: "user-id",
    });
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      deleteCategoryUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.deleteCategoryUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      deleteCategoryUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error).not.toHaveProperty("context");
  });
});
