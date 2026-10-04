import { api } from "@infrastructure/api";

import getFamilies from "../getFamilies";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const apiFamilies = [
  {
    createdAt: "2026-10-04T12:00:00.000Z",
    id: "6f1c2a52-3d1e-4c8e-9a3b-1b2c3d4e5f60",
    name: "Example Family",
    ownerId: "0b9d3c1e-2f4a-4b6c-8d7e-9f0a1b2c3d4e",
    updatedAt: "2026-10-04T12:00:00.000Z",
  },
];
const userId = "0b9d3c1e-2f4a-4b6c-8d7e-9f0a1b2c3d4e";
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getFamilies(userId);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiFamilies, userId };

export { mocks, setup, setupThrowable, spies };
