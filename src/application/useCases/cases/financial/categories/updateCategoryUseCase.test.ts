import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateCategoryUseCase.mocks";

const updateCategorySpy = spies.financialRepositoryCategory.updateCategory;

it("SHOULD update all fields of transaction", () => {
  setup();

  expect(updateCategorySpy).toHaveBeenCalledTimes(1);
  expect(updateCategorySpy).toHaveBeenCalledWith({
    depthLevel: mocks.defaultParams.depthLevel,
    icon: mocks.defaultParams.icon,
    id: mocks.defaultParams.id,
    name: mocks.defaultParams.name,
    owner: OwnerType[mocks.defaultParams.owner as never],
    ownerId: mocks.defaultParams.ownerId,
    parentId: mocks.defaultParams.parentId,
  });
});

it("SHOULD throw if the OWNER is invalid", async () => {
  const result = await setupThrowable({ owner: "INVALID_OWNER" });

  expect(result).toBeInstanceOf(FieldInvalid);
  expect(result).toHaveProperty("message", "The field owner are invalid");
});

it("SHOULD throw if the repository throws", async () => {
  updateCategorySpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  updateCategorySpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.updateCategoryUseCase",
  });
});
