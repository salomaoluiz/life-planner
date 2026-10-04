import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

import getUser from "../getUser";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));
jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

const apiUser = {
  email: "test@example.com",
  id: "8a6e0804-2bd0-4672-b79d-d97027f9071a",
  name: "Test User",
  photoUrl: "https://example.com/a.png",
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getUser();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  get: jest.mocked(api.get),
  getToken: jest.mocked(tokenStorage.getToken),
};
const mocks = { apiUser };

export { mocks, setup, setupThrowable, spies };
