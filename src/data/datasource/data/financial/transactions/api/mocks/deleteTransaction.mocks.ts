import { api } from "@infrastructure/api";

import deleteTransaction from "../deleteTransaction";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn() },
}));

// region mocks
const params = {
  id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteTransaction(params);
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
