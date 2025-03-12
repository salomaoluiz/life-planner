import AsyncStorage from "@react-native-async-storage/async-storage";

import { setString } from "@infrastructure/storage/sets";

// region spies

const setItemSpy = jest.spyOn(AsyncStorage, "setItem");

// endregion spies

const setup = {
  setString,
};

const spies = {
  setItem: setItemSpy,
};

export { setup, spies };
