import ConfigsModel from "../ConfigsModel";

// region mocks

const jsonMock = {
  dark_mode: false,
  language: "en-US",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new ConfigsModel({
    darkMode: jsonMock.dark_mode,
    language: jsonMock.language,
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
