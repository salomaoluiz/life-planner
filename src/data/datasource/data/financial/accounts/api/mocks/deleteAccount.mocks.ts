import { api } from "@infrastructure/api";

import deleteAccount from "../deleteAccount";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn() },
}));

// region mocks
const params = {
  id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteAccount(params);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { delete: jest.mocked(api.delete) };
const mocks = { params };

export { mocks, setup, setupThrowable, spies };
