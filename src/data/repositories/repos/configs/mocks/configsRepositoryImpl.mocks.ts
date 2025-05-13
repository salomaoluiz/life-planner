import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";

import configsRepositoryImpl from "../configsRepositoryImpl";
import * as getConfigs from "../getConfigs";
import * as saveConfigs from "../saveConfigs";

// region mocks

// endregion mocks

// region spies

const getConfigsSpy = jest
  .spyOn(getConfigs, "default")
  .mockResolvedValue("getConfigs response" as never);
const saveConfigsSpy = jest
  .spyOn(saveConfigs, "default")
  .mockResolvedValue("saveConfigs response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return configsRepositoryImpl();
}

const spies = {
  getConfigs: getConfigsSpy,
  saveConfigs: saveConfigsSpy,
};

const mocks = {
  datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
