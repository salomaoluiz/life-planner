import { api } from "@infrastructure/api";

import createStockItem, { Params } from "../createStockItem";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const ownerId = "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d";
const defaultParams: Params = {
  barcode: "7890000000001",
  categoryId: "category-id",
  description: "Rice",
  expirationDate: new Date(2027, 2, 1),
  idealQuantity: 5,
  locationId: "location-id",
  minQuantity: 1,
  notes: "private note",
  openedShelfLifeDays: 5,
  owner: "USER",
  ownerId,
  purchaseDate: new Date(2026, 10, 9),
  quantity: 2.5,
  stockOnly: false,
  unit: "kilogram",
  warnDaysClosed: 7,
  warnDaysOpened: 1,
};
const apiItem = {
  barcode: "7890000000001",
  brand: null,
  category: null,
  categoryId: null,
  createdAt: "2026-10-05T12:00:00.000Z",
  description: "Rice",
  expirationStatus: "NONE",
  hasOpenLot: false,
  id: "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10",
  idealQuantity: null,
  location: null,
  locationId: null,
  lots: [],
  minQuantity: null,
  nearestExpiration: null,
  needsRestock: false,
  notes: "private note",
  openedShelfLifeDays: null,
  owner: "USER",
  ownerId,
  quantity: 2.5,
  restockQuantity: 1,
  stockOnly: false,
  unit: "kilogram",
  warnDaysClosed: 7,
  warnDaysOpened: 1,
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
