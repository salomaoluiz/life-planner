import * as SecureStore from "expo-secure-store";

import { asyncStorage } from "@infrastructure/storage";
import { isWeb } from "@utils/platform";

import { tokenStorage } from "../index";

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@utils/platform");
jest.mock("@infrastructure/storage", () => ({
  asyncStorage: {
    deleteItem: jest.fn(),
    getString: jest.fn(),
    setString: jest.fn(),
  },
  StorageKeys: { string: { SESSION_TOKEN: "@session_token" } },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return tokenStorage;
}

const spies = {
  asyncStorage: jest.mocked(asyncStorage),
  secureStore: jest.mocked(SecureStore),
};

const mocks = {
  platform: { isWeb: jest.mocked(isWeb) },
};

export { mocks, setup, spies };
