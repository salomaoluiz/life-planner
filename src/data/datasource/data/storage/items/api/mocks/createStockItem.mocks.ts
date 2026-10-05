import { api } from "@infrastructure/api";

import createStockItem, { Params } from "../createStockItem";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const ownerId = "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d";
const defaultParams: Params = {
  barcode: "7890000000001",
  description: "Rice",
  expirationDate: new Date("2027-03-01T00:00:00.000Z"),
  notes: "private note",
  owner: "USER",
  ownerId,
  quantity: 2,
  unit: "kilogram",
};
const apiItem = {
  barcode: "7890000000001",
  brand: null,
  createdAt: "2026-10-05T12:00:00.000Z",
  description: "Rice",
  expirationDate: "2027-03-01T00:00:00.000Z",
  id: "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10",
  notes: "private note",
  openingDate: null,
  owner: "USER",
  ownerId,
  purchaseDate: null,
  quantity: 2,
  unit: "kilogram",
  updatedAt: "2026-10-05T12:00:00.000Z",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params: Params = defaultParams) {
  return createStockItem(params);
}

async function setupThrowable(params: Params = defaultParams) {
  try {
    await setup(params);
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { apiItem, defaultParams };

export { mocks, setup, setupThrowable, spies };
