import { api } from "@infrastructure/api";

import updateStockItem, { Params } from "../updateStockItem";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn() },
}));

// region mocks
const itemId = "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10";
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params: Params) {
  return updateStockItem(params);
}

async function setupThrowable(params: Params) {
  try {
    await setup(params);
  } catch (error) {
    return error;
  }
}

const spies = { patch: jest.mocked(api.patch) };
const mocks = { itemId };

export { mocks, setup, setupThrowable, spies };
