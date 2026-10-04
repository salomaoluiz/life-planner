import { api } from "@infrastructure/api";

import deleteFamily from "../deleteFamily";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn() },
}));

// region mocks
const id = "6f1c2a52-3d1e-4c8e-9a3b-1b2c3d4e5f60";
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteFamily(id);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { delete: jest.mocked(api.delete) };
const mocks = { id };

export { mocks, setup, setupThrowable, spies };
