import { MMKV } from "react-native-mmkv";

import { setCacheObject, setString } from "@infrastructure/storage/sets";

// region mocks
const setCacheObjectMock = {
  value: "any",
};

// endregion mocks

// region spies

const setItemSpy = jest.spyOn(MMKV.prototype, "set");

// endregion spies

const setup = {
  setCacheObject,
  setString,
};

const spies = {
  setItem: setItemSpy,
};

const mocks = {
  setCacheObjectMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
