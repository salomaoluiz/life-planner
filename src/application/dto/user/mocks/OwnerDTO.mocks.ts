import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

import OwnerDTO, { IOwnerDTO } from "../OwnerDTO";

// region mocks

const defaultProps: IOwnerDTO = {
  id: "e801aec5-fc86-4f70-927f-41d847fba14b",
  name: "John Doe",
  type: OwnerType.USER,
};

const defaultOwnerEntity = new OwnerEntity({
  name: defaultProps.name,
  ownerId: defaultProps.id,
  type: defaultProps.type,
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: OwnerEntity = defaultOwnerEntity) {
  return OwnerDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
