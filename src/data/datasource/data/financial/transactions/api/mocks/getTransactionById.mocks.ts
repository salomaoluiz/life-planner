import { api } from "@infrastructure/api";

import getTransactionById from "../getTransactionById";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

const apiTransaction = {
  accountId: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  categoryId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  currency: "BRL",
  date: "2026-10-03",
  description: "Weekly groceries",
  id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  owner: "USER",
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  paid: true,
  type: "EXPENSE",
  value: 23490,
};
const lookups = {
  categories: {
    "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607": { name: "Groceries" },
  },
  tags: {},
};
// Spec 079: the lean response.
const apiResponse = { item: apiTransaction, lookups };

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(id: string = apiTransaction.id) {
  return getTransactionById(id);
}

async function setupThrowable(id: string = apiTransaction.id) {
  try {
    await setup(id);
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiResponse, apiTransaction, lookups };

export { mocks, setup, setupThrowable, spies };
