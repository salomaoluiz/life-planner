import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";

import updateCategoryAppearanceUseCase from "./updateCategoryAppearanceUseCase";

const repository = jest.mocked(repositoriesMocks.financialRepository.category);
const descendants = [{ iconColor: "#112233", id: "child" }];

async function run(params = {}) {
  return updateCategoryAppearanceUseCase(repositoriesMocks).execute({
    descendants,
    id: "parent",
    ...params,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.updateCategoryAppearance.mockResolvedValue(undefined);
});

it("SHOULD forward the fields and descendants to the repository", async () => {
  await run({ icon: "food", iconColor: "#F97316", type: "EXPENSE" });

  expect(repository.updateCategoryAppearance).toHaveBeenCalledWith({
    descendants,
    icon: "food",
    iconColor: "#F97316",
    id: "parent",
    name: undefined,
    parentId: undefined,
    scope: undefined,
    status: undefined,
    type: CategoryType.EXPENSE,
  });
});

it("SHOULD reject empty descendants WITHOUT calling the repository", async () => {
  await expect(run({ descendants: [] })).rejects.toBeInstanceOf(FieldInvalid);
  expect(repository.updateCategoryAppearance).not.toHaveBeenCalled();
});

it("SHOULD add context to a domain error and re-throw it", async () => {
  const error = new BusinessError();

  repository.updateCategoryAppearance.mockRejectedValueOnce(error);

  await expect(run()).rejects.toBe(error);
});

it("SHOULD re-throw unknown errors untouched", async () => {
  const error = new Error("boom");

  repository.updateCategoryAppearance.mockRejectedValueOnce(error);

  await expect(run()).rejects.toBe(error);
});
