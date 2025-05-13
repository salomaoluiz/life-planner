import UserModel from "../UserModel";

// region mocks

const jsonMock = {
  avatar_url: "https://example.com/avatar.jpg",
  email: "teste@gmail.com",
  id: "074782ac-9605-4632-8459-3a82bb9e8d83",
  name: "User Name",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new UserModel({
    avatarURL: jsonMock.avatar_url,
    email: jsonMock.email,
    id: jsonMock.id,
    name: jsonMock.name,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
