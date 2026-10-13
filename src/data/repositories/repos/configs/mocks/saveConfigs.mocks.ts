import ConfigsModel from "@data/models/configs/ConfigsModel";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import cache from "@infrastructure/cache";

import saveConfigs, { Params } from "../saveConfigs";

// region mocks
const defaultParams: Params = {
  language: "en-US",
  themeMode: ThemeMode.SYSTEM,
};

const configModelMock = new ConfigsModel({
  language: "en-US",
  themeMode: ThemeMode.SYSTEM,
}).toJSON();
// endregion mocks

// region spies
const setCacheSpy = jest.spyOn(cache, "set");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<Params>) {
  return saveConfigs({ ...defaultParams, ...props });
}

const spies = {
  setCache: setCacheSpy,
};

const mocks = {
  configsModel: configModelMock,
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
