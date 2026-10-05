import { api } from "@infrastructure/api";

import getCategories from "../getCategories";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const ownerIds = [
  "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
];
const apiCategories = [
  {
    createdAt: "2026-10-04T12:00:00.000Z",
    depthLevel: 0,
    icon: "cart",
    iconColor: "#2E7D32",
    id: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
    name: "Groceries",
    owner: "FAMILY",
    ownerId: ownerIds[1],
    parentId: null,
    type: "EXPENSE",
    updatedAt: "2026-10-04T12:00:00.000Z",
  },
];
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(ids: string[] = ownerIds) {
  return getCategories(ids);
}

async function setupThrowable(ids: string[] = ownerIds) {
  try {
    await setup(ids);
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiCategories, ownerIds };

export { mocks, setup, setupThrowable, spies };
