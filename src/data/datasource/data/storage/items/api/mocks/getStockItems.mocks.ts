import { api } from "@infrastructure/api";

import getStockItems from "../getStockItems";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const ownerId = "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d";
const apiItems = [
  {
    barcode: null,
    brand: null,
    category: null,
    categoryId: null,
    createdAt: "2026-09-30T12:01:00.000Z",
    description: "Whole milk",
    expirationStatus: "EXPIRING",
    hasOpenLot: false,
    id: "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10",
    idealQuantity: null,
    location: null,
    locationId: null,
    minQuantity: null,
    nearestExpiration: "2026-10-20",
    needsRestock: false,
    notes: null,
    openedShelfLifeDays: null,
    owner: "FAMILY",
    ownerId,
    quantity: 6,
    restockQuantity: 1,
    stockOnly: false,
    unit: "liter",
    warnDaysClosed: 7,
    warnDaysOpened: 1,
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
