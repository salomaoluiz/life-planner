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
  paid: undefined as boolean | undefined,
  type: "EXPENSE" as never,
  value: "234,90",
};
const apiTransaction = {
  accountId: params.accountId,
  categoryId: params.categoryId,
  currency: "BRL",
  date: "2026-10-03",
  description: "Weekly groceries",
  id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  owner: "USER",
  ownerId: params.ownerId,
  paid: true,
  type: "EXPENSE",
  value: 23490,
};
const lookups = {
  categories: { [params.categoryId]: { name: "Groceries" } },
  tags: {},
};
// Spec 079: the lean response.
const apiResponse = { item: apiTransaction, lookups };
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(
  override: Partial<Parameters<typeof createTransaction>[0]> = {},
) {
  return createTransaction({ ...params, ...override });
}

async function setupThrowable(
  override: Partial<Parameters<typeof createTransaction>[0]> = {},
) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { apiResponse, apiTransaction, lookups, params };

export { mocks, setup, setupThrowable, spies };
