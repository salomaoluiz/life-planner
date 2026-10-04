import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import createCategoryUseCase from "./createCategoryUseCase";
import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createCategoryUseCase.mocks";

it("SHOULD call repository createCategory correctly", async () => {
  await setup();
  expect(
    spies.financialRepositoryCategory.createCategory,
  ).toHaveBeenCalledTimes(1);
  expect(spies.financialRepositoryCategory.createCategory).toHaveBeenCalledWith(
    {
      depthLevel: mocks.defaultParams.depthLevel,
      icon: mocks.defaultParams.icon,
      iconColor: mocks.defaultParams.iconColor,
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

describe("type fallback and error handling", () => {
  const params = {
    depthLevel: 0,
    icon: "icon",
    iconColor: "black",
    name: "Category",
    owner: "USER",
    ownerId: "user-id",
    parentId: undefined,
    type: "EXPENSE",
  };
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.category.createCategory,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD map INCOME type", async () => {
    await createCategoryUseCase(repositoriesMocks).execute({
      ...params,
      type: "INCOME",
    });

    expect(repository()).toHaveBeenCalledWith(
      expect.objectContaining({ type: CategoryType.INCOME }),
    );
  });

  it("SHOULD fall back to EXPENSE WHEN the type is unknown", async () => {
    await createCategoryUseCase(repositoriesMocks).execute({
      ...params,
      type: "NOPE",
    });

    expect(repository()).toHaveBeenCalledWith(
      expect.objectContaining({ type: CategoryType.EXPENSE }),
    );
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      createCategoryUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.createCategoryUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      createCategoryUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
  });
});
