import CategoryDTO, {
  ICategoryDTO,
} from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import FinancialCategoryViewModel from "../models/FinancialCategoryViewModel";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function makeCategoryDTO(overrides: Partial<ICategoryDTO> = {}) {
  return new CategoryDTO({
    depthLevel: 0,
    icon: "food",
    id: "cat-1",
    name: "Food",
    owner: "USER",
    ownerId: "owner-1",
    type: "EXPENSE",
    ...overrides,
  });
}

function makeCategoryViewModel(
  overrides: Partial<ICategoryDTO> = {},
  hasSubcategories = false,
) {
  return new FinancialCategoryViewModel(
    makeCategoryDTO(overrides),
    owners,
    hasSubcategories,
  );
}

export { makeCategoryDTO, makeCategoryViewModel, owners };
