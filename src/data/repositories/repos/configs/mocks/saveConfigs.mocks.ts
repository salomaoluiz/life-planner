import ConfigsModel from "@data/models/configs/ConfigsModel";
import cache from "@infrastructure/cache";

import saveConfigs, { Params } from "../saveConfigs";

// region mocks
const defaultParams: Params = {
  darkMode: false,
  language: "en-US",
};

const configModelMock = new ConfigsModel({
  darkMode: false,
  language: "en-US",
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
