import { getString } from "@infrastructure/storage/gets";

import AsyncStorage from "@react-native-async-storage/async-storage";

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

export { setup, spies, mocks };
