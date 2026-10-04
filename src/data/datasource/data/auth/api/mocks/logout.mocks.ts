import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

import logout from "../logout";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
}));
jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
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
};

export { setup, setupThrowable, spies };
