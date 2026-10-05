import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import createTransaction from "../createTransaction";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const params = {
  accountId: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  category: "Groceries",
  categoryId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  // What the date picker produces: local midnight of the chosen day.
  date: new Date(2026, 9, 3).toISOString(),
  description: "Weekly groceries",
  owner: OwnerType.USER,
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  type: "EXPENSE" as never,
  value: "234,90",
};
const apiTransaction = {
  account: { icon: "bank", id: params.accountId, name: "Checking" },
  accountId: params.accountId,
  category: {
    icon: "cart",
    iconColor: "#2E7D32",
    id: params.categoryId,
    name: "Groceries",
  },
  categoryId: params.categoryId,
  createdAt: "2026-10-04T12:00:00.000Z",
  date: "2026-10-03",
  description: "Weekly groceries",
  id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  owner: "USER",
  ownerId: params.ownerId,
  type: "EXPENSE",
  updatedAt: "2026-10-04T12:00:00.000Z",
  value: 23490,
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(override: Partial<typeof params> = {}) {
  return createTransaction({ ...params, ...override });
}

async function setupThrowable(override: Partial<typeof params> = {}) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { apiTransaction, params };

export { mocks, setup, setupThrowable, spies };
