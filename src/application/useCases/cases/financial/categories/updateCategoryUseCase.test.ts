import { FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateCategoryUseCase.mocks";

it("SHOULD call repository updateCategory correctly", async () => {
  await setup();
  expect(
    spies.financialRepositoryCategory.updateCategory,
  ).toHaveBeenCalledTimes(1);
  expect(spies.financialRepositoryCategory.updateCategory).toHaveBeenCalledWith(
    {
      depthLevel: mocks.defaultParams.depthLevel,
      icon: mocks.defaultParams.icon,
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
