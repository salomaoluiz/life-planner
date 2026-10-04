import { api } from "@infrastructure/api";

import getUserById from "../getUserById";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

const id = "8a6e0804-2bd0-4672-b79d-d97027f9071a";
const apiUser = {
  email: "test@example.com",
  id,
  name: "Test User",
  photoUrl: "https://example.com/a.png",
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getUserById(id);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiUser, id };

export { mocks, setup, setupThrowable, spies };
