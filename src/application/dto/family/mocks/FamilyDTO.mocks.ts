import FamilyEntity from "@domain/entities/family/FamilyEntity";

import FamilyDTO, { IFamilyDTO } from "../FamilyDTO";

// region mocks
const defaultProps: IFamilyDTO = {
  id: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  name: "Family Name",
  ownerId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
};

const defaultFamilyEntity = new FamilyEntity({
  id: defaultProps.id,
  name: defaultProps.name,
  ownerId: defaultProps.ownerId,
});
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: FamilyEntity = defaultFamilyEntity) {
  return FamilyDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
