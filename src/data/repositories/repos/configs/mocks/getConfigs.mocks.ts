import ConfigsModel from "@data/models/configs/ConfigsModel";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import cache from "@infrastructure/cache";

import getConfigs from "../getConfigs";

// region mocks
const configModelMock = new ConfigsModel({
  language: "en-US",
  themeMode: ThemeMode.SYSTEM,
}).toJSON();

// endregion mocks

// region spies
const getCacheSpy = jest.spyOn(cache, "get");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getConfigs();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  getCache: getCacheSpy,
};

const mocks = {
  configsModel: configModelMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
