import LoginWithGoogleModel from "../LoginWithGoogleModel";

// region mocks

const jsonMock = {
  avatar_url: "https://example.com/avatar.jpg",
  email: "teste@gmail.com",
  id: "47d14a22-61dd-46e8-8a13-8240639a664e",
  name: "Test User",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new LoginWithGoogleModel({
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
