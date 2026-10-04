import { api } from "@infrastructure/api";

import createFamily from "../createFamily";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const params = {
  name: "Example Family",
  ownerId: "0b9d3c1e-2f4a-4b6c-8d7e-9f0a1b2c3d4e",
};
const apiFamily = {
  createdAt: "2026-10-04T12:00:00.000Z",
  id: "6f1c2a52-3d1e-4c8e-9a3b-1b2c3d4e5f60",
  name: "Example Family",
  ownerId: params.ownerId,
  updatedAt: "2026-10-04T12:00:00.000Z",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return createFamily(params);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { apiFamily, params };

export { mocks, setup, setupThrowable, spies };
