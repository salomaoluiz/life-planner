import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import createCategory from "../createCategory";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const params = {
  depthLevel: 2,
  icon: "store",
  iconColor: "black",
  name: "Supermarket",
  owner: OwnerType.FAMILY,
  ownerId: "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
  parentId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  type: "EXPENSE",
};
const apiCategory = {
  createdAt: "2026-10-04T12:00:00.000Z",
  depthLevel: 1,
  icon: "store",
  iconColor: "#000000",
  id: "2e1f9b4c-6d7f-4081-9ba2-c3d4e5f60718",
  name: "Supermarket",
  owner: "FAMILY",
  ownerId: params.ownerId,
  parentId: params.parentId,
  type: "EXPENSE",
  updatedAt: "2026-10-04T12:00:00.000Z",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(override: Partial<typeof params> = {}) {
  return createCategory({ ...params, ...override });
}

async function setupThrowable(override: Partial<typeof params> = {}) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { apiCategory, params };

export { mocks, setup, setupThrowable, spies };
