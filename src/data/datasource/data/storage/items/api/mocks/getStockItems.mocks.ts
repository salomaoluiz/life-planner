import { api } from "@infrastructure/api";

import getStockItems from "../getStockItems";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const ownerId = "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d";
const apiItems = [
  {
    barcode: "7890000000001",
    brand: null,
    createdAt: "2026-09-30T12:01:00.000Z",
    description: "Whole milk",
    expirationDate: "2026-10-20T00:00:00.000Z",
    id: "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10",
    notes: null,
    openingDate: null,
    owner: "FAMILY",
    ownerId,
    purchaseDate: null,
    quantity: 6,
    unit: "liter",
    updatedAt: "2026-09-30T12:01:00.000Z",
  },
];
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(id: string = ownerId) {
  return getStockItems(id);
}

async function setupThrowable(id: string = ownerId) {
  try {
    await setup(id);
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiItems, ownerId };

export { mocks, setup, setupThrowable, spies };
