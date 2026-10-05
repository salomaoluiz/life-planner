import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import updateTransaction from "../updateTransaction";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn() },
}));

// region mocks
const id = "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b";
const params = {
  accountId: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  category: "Groceries",
  categoryId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  date: new Date(2026, 9, 3).toISOString(),
  description: "Weekly groceries",
  id,
  owner: OwnerType.USER,
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  type: "EXPENSE" as never,
  value: "234,90",
};
const onlyId = {
  accountId: undefined,
  category: undefined,
  categoryId: undefined,
  date: undefined,
  description: undefined,
  owner: undefined,
  ownerId: undefined,
  type: undefined,
  value: undefined,
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(
  override: Partial<Parameters<typeof updateTransaction>[0]> = {},
) {
  return updateTransaction({ ...params, ...override });
}

async function setupThrowable(
  override: Partial<Parameters<typeof updateTransaction>[0]> = {},
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
