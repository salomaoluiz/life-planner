import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

import logout from "../logout";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
}));
jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getRefreshToken: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(api.post).mockResolvedValue(undefined);
  jest.mocked(tokenStorage.getRefreshToken).mockResolvedValue("refresh");
});

async function setup() {
  return logout();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  api: jest.mocked(api),
  clearToken: jest.mocked(tokenStorage.clearToken),
  getRefreshToken: jest.mocked(tokenStorage.getRefreshToken),
};

export { setup, setupThrowable, spies };
