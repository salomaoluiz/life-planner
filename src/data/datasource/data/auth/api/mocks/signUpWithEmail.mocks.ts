import { api } from "@infrastructure/api";

import signUpWithEmail from "../signUpWithEmail";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const params = {
  email: "test@example.com",
  name: "Test User",
  password: "password123",
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return signUpWithEmail(params);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { params };

export { mocks, setup, setupThrowable, spies };
