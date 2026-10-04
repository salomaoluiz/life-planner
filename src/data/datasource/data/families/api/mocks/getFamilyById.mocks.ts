import { api } from "@infrastructure/api";

import getFamilyById from "../getFamilyById";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const familyId = "6f1c2a52-3d1e-4c8e-9a3b-1b2c3d4e5f60";
const apiFamily = {
  createdAt: "2026-10-04T12:00:00.000Z",
  id: familyId,
  name: "Example Family",
  ownerId: "0b9d3c1e-2f4a-4b6c-8d7e-9f0a1b2c3d4e",
  updatedAt: "2026-10-04T12:00:00.000Z",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getFamilyById(familyId);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiFamily, familyId };

export { mocks, setup, setupThrowable, spies };
