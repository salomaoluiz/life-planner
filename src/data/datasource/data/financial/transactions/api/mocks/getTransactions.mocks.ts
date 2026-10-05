import { api } from "@infrastructure/api";

import getTransactions from "../getTransactions";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const ownerIds = [
  "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
];
const apiTransactions = [
  {
    account: {
      icon: "bank",
      id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
      name: "Checking",
    },
    accountId: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
    category: {
      icon: "cart",
      iconColor: "#2E7D32",
      id: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
      name: "Groceries",
    },
    categoryId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
    createdAt: "2026-10-04T12:00:00.000Z",
    date: "2026-10-03",
    description: "Weekly groceries",
    id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
    owner: "USER",
    ownerId: ownerIds[0],
    type: "EXPENSE",
    updatedAt: "2026-10-04T12:00:00.000Z",
    value: 23490,
  },
];
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(ids: string[] = ownerIds) {
  return getTransactions(ids);
}

async function setupThrowable(ids: string[] = ownerIds) {
  try {
    await setup(ids);
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiTransactions, ownerIds };

export { mocks, setup, setupThrowable, spies };
