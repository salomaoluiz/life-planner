import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import updateCategory from "../updateCategory";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn() },
}));

// region mocks
const id = "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607";
const params = {
  depthLevel: 3,
  icon: "store",
  iconColor: "black",
  id,
  name: "Supermarket",
  owner: OwnerType.USER,
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  parentId: "2e1f9b4c-6d7f-4081-9ba2-c3d4e5f60718",
  type: "INCOME",
};
const onlyId = {
  depthLevel: undefined,
  icon: undefined,
  iconColor: undefined,
  name: undefined,
  owner: undefined,
  ownerId: undefined,
  parentId: undefined,
  type: undefined,
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(
  override: Partial<Parameters<typeof updateCategory>[0]> = {},
) {
  return updateCategory({ ...params, ...override });
}

async function setupThrowable(
  override: Partial<Parameters<typeof updateCategory>[0]> = {},
) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { patch: jest.mocked(api.patch) };
const mocks = { id, onlyId, params };

export { mocks, setup, setupThrowable, spies };
