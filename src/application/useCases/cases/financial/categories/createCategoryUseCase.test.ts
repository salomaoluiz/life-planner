import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createCategoryUseCase.mocks";

const createCategorySpy = spies.financialRepositoryCategory.createCategory;

it("SHOULD create a transaction", () => {
  setup();

  expect(createCategorySpy).toHaveBeenCalledTimes(1);
  expect(createCategorySpy).toHaveBeenCalledWith({
    depthLevel: mocks.defaultParams.depthLevel,
    icon: mocks.defaultParams.icon,
    name: mocks.defaultParams.name,
    owner: OwnerType[mocks.defaultParams.owner as never],
    ownerId: mocks.defaultParams.ownerId,
    parentId: mocks.defaultParams.parentId,
  });
});

it("SHOULD throw if the repository throws", async () => {
  createCategorySpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  createCategorySpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.createCategoryUseCase",
  });
});

it("SHOULD throw if the OWNER is not a valid one", async () => {
  const result = await setupThrowable({ owner: "INVALID_OWNER" });

  expect(result).toBeInstanceOf(FieldInvalid);
  expect(result).toHaveProperty("message", "The field owner are invalid");
});
