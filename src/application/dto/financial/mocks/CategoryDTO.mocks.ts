import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import CategoryDTO, { ICategoryDTO } from "../CategoryDTO";

// region mocks
const defaultProps: ICategoryDTO = {
  depthLevel: 0,
  icon: "icon",
  id: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  name: "Category",
  owner: OwnerType.FAMILY,
  ownerId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  parentId: undefined,
};

const defaultCategoryEntity = new CategoryEntity({
  depthLevel: defaultProps.depthLevel,
  icon: defaultProps.icon,
  id: defaultProps.id,
  name: defaultProps.name,
  owner: defaultProps.owner as OwnerType,
  ownerId: defaultProps.ownerId,
  parentId: defaultProps.parentId,
});
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: CategoryEntity = defaultCategoryEntity) {
  return CategoryDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
