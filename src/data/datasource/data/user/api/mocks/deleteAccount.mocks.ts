import { api } from "@infrastructure/api";

import deleteAccount from "../deleteAccount";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(email = "test@example.com") {
  return deleteAccount(email);
}

async function setupThrowable(email = "test@example.com") {
  try {
    await setup(email);
  } catch (error) {
    return error;
  }
}

const spies = { delete: jest.mocked(api.delete) };
const mocks = { email: "test@example.com" };

export { mocks, setup, setupThrowable, spies };
