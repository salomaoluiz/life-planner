import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

import UserDTO, { IUserDTO } from "../UserDTO";

// region mocks

const defaultProps: IUserDTO = {
  email: "teste@gmail.com",
  id: "e801aec5-fc86-4f70-927f-41d847fba14b",
  name: "John Doe",
  photoUrl: "https://example.com/photo.jpg",
};

const defaultUserEntity = new UserProfileEntity({
  email: defaultProps.email,
  id: defaultProps.id,
  name: defaultProps.name,
  photoUrl: defaultProps.photoUrl,
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: UserProfileEntity = defaultUserEntity) {
  return UserDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
