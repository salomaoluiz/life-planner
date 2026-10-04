import UserModel from "../UserModel";

// region mocks

const jsonMock = {
  email: "teste@gmail.com",
  id: "074782ac-9605-4632-8459-3a82bb9e8d83",
  name: "User Name",
  photoUrl: "https://example.com/avatar.jpg",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new UserModel({
    avatarURL: jsonMock.photoUrl,
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
