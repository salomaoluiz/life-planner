import CategoryDTO, {
  ICategoryDTO,
} from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function makeCategoryDTO(overrides: Partial<ICategoryDTO> = {}) {
  return new CategoryDTO({
    icon: "food",
    iconColor: "#F59E0B",
    id: "cat-1",
    name: "Food",
    owner: "USER",
    ownerId: "owner-1",
    type: "EXPENSE",
    ...overrides,
  });
}

export { makeCategoryDTO, owners };
