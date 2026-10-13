import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateCategoryUseCase.mocks";
import updateCategoryUseCase from "./updateCategoryUseCase";

it("SHOULD call repository updateCategory correctly", async () => {
  await setup();
  expect(
    spies.financialRepositoryCategory.updateCategory,
  ).toHaveBeenCalledTimes(1);
  expect(spies.financialRepositoryCategory.updateCategory).toHaveBeenCalledWith(
    {
      depthLevel: mocks.defaultParams.depthLevel,
      icon: mocks.defaultParams.icon,
      iconColor: mocks.defaultParams.iconColor,
      id: mocks.defaultParams.id,
      name: mocks.defaultParams.name,
      owner: OwnerType.FAMILY,
      ownerId: mocks.defaultParams.ownerId,
      parentId: mocks.defaultParams.parentId,
      type: CategoryType.EXPENSE,
    },
  );
});

it("SHOULD throw FieldInvalid when owner is invalid", async () => {
  const error = await setupThrowable({ owner: "INVALID" });
  expect(error).toBeInstanceOf(FieldInvalid);
});

it("SHOULD forward iconColor to the repository", async () => {
  await setup({ iconColor: "#3B82F6" });

  expect(spies.financialRepositoryCategory.updateCategory).toHaveBeenCalledWith(
    expect.objectContaining({ iconColor: "#3B82F6" }),
  );
});

it("SHOULD forward parentId null (make a main category) untouched", async () => {
  await setup({ parentId: null });

  expect(spies.financialRepositoryCategory.updateCategory).toHaveBeenCalledWith(
    expect.objectContaining({ parentId: null }),
  );
});

describe("type fallback and error handling", () => {
  const params = {
    depthLevel: 0,
    icon: "icon",
    iconColor: "black",
    id: "cat-id",
    name: "Category",
    owner: "USER",
    ownerId: "user-id",
    parentId: undefined,
    type: "EXPENSE",
  };
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.category.updateCategory,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD map INCOME type", async () => {
    await updateCategoryUseCase(repositoriesMocks).execute({
      ...params,
      type: "INCOME",
    });

    expect(repository()).toHaveBeenCalledWith(
      expect.objectContaining({ type: CategoryType.INCOME }),
    );
  });

  it("SHOULD leave the type undefined WHEN it is unknown or missing", async () => {
    await updateCategoryUseCase(repositoriesMocks).execute({
      ...params,
      type: "NOPE",
    });
    await updateCategoryUseCase(repositoriesMocks).execute({
      ...params,
      type: undefined,
    });

    expect(repository()).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: undefined }),
    );
    expect(repository()).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: undefined }),
    );
  });

  it("SHOULD leave the owner undefined WHEN it is not provided", async () => {
    await updateCategoryUseCase(repositoriesMocks).execute({
      ...params,
      owner: undefined,
    });

    expect(repository()).toHaveBeenCalledWith(
      expect.objectContaining({ owner: undefined }),
    );
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      updateCategoryUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.updateCategoryUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      updateCategoryUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
  });
});
