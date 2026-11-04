import { api } from "@infrastructure/api";

import hasCategoryTransactions from "../hasCategoryTransactions";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

const ownerIds = [
  "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
];
const categoryId = "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607";

function page(items: Record<string, unknown>[]) {
  return { items, nextCursor: null };
}

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(ids: string[] = ownerIds) {
  return hasCategoryTransactions(ids, categoryId);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { categoryId, ownerIds };

export { mocks, page, setup, setupThrowable, spies };
