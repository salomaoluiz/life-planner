import AsyncStorage from "@react-native-async-storage/async-storage";

import { getString } from "@infrastructure/storage/gets";

// region mocks

const getItemResponse = "getItemResponse";

// endregion mocks

// region spies

const getItemSpy = jest.spyOn(AsyncStorage, "getItem");

// endregion spies

const setup = {
  getString,
};

const spies = {
  getItem: getItemSpy,
};

const mocks = {
  getItemResponse,
};

export { mocks, setup, spies };
