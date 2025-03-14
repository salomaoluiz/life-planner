import { MMKV } from "react-native-mmkv";

import { getCacheObject, getString } from "@infrastructure/storage/gets";

// region mocks

const getItemResponse = "getItemResponse";
const cacheObjectMock = {
  data: "value",
};

// endregion mocks
// region spies

const getItemSpy = jest.spyOn(MMKV.prototype, "getString");

// endregion spies

const setup = {
  getCacheObject,
  getString,
};

const spies = {
  getItem: getItemSpy,
};

const mocks = {
  cacheObjectMock,
  getItemResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
