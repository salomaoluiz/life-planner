import * as SecureStore from "expo-secure-store";

import { setUser } from "@infrastructure/monitoring";
import { asyncStorage } from "@infrastructure/storage";
import { isWeb } from "@utils/platform";

import { tokenStorage } from "../index";

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@utils/platform");
jest.mock("@infrastructure/monitoring", () => ({ setUser: jest.fn() }));
jest.mock("@infrastructure/storage", () => ({
  asyncStorage: {
    deleteItem: jest.fn(),
    getString: jest.fn(),
    setString: jest.fn(),
  },
  StorageKeys: {
    string: {
      SESSION_REFRESH_TOKEN: "@session_refresh_token",
      SESSION_TOKEN: "@session_token",
    },
  },
}));

beforeEach(async () => {
  // The access token is memoized in the module: forget it so each test starts cold.
  await tokenStorage.clearToken();
  jest.clearAllMocks();
});

function setup() {
  return tokenStorage;
}

const spies = {
  asyncStorage: jest.mocked(asyncStorage),
  secureStore: jest.mocked(SecureStore),
  setUser: jest.mocked(setUser),
};

const mocks = {
  platform: { isWeb: jest.mocked(isWeb) },
};

export { mocks, setup, spies };
