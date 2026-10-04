import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

import loginWithEmail from "../loginWithEmail";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));
jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

const params = { email: "test@example.com", password: "password123" };

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginWithEmail(params);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  post: jest.mocked(api.post),
  setToken: jest.mocked(tokenStorage.setToken),
};
const mocks = { params };

export { mocks, setup, setupThrowable, spies };
