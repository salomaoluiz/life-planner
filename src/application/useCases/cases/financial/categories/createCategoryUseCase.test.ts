import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

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
