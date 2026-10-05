import { api } from "@infrastructure/api";

import deleteCategory from "../deleteCategory";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn() },
}));

// region mocks
const params = {
  id: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteCategory(params);
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
