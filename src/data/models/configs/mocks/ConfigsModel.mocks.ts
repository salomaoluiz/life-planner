import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

import ConfigsModel from "../ConfigsModel";

// region mocks

const jsonMock = {
  language: "en-US",
  theme_mode: "DARK",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new ConfigsModel({
    language: jsonMock.language,
    themeMode: ThemeMode.DARK,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

export { mocks, setup, spies };
