import { api } from "@infrastructure/api";

import deleteStockItem from "../deleteStockItem";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn() },
}));

// region mocks
const itemId = "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10";
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(id: string = itemId) {
  return deleteStockItem(id);
}

async function setupThrowable(id: string = itemId) {
  try {
    await setup(id);
  } catch (error) {
    return error;
  }
}

const spies = { delete: jest.mocked(api.delete) };
const mocks = { itemId };

export { mocks, setup, setupThrowable, spies };
