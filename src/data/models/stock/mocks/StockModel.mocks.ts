import StockModel from "../StockModel";

// region mocks

export const apiLotMock = {
  effectiveExpiration: "2026-11-15",
  expirationDate: "2026-11-30",
  expirationStatus: "EXPIRING",
  id: "5a2a3a7c-6b0f-4f6e-9d0b-0d6f7a1b2c3d",
  openedAt: "2026-11-10",
  purchaseDate: "2026-11-01",
  quantity: 1.5,
};

export const apiItemMock = {
  barcode: "1234567890123",
  brand: "BrandName",
  category: {
    archived: false,
    id: "2a2a3a7c-6b0f-4f6e-9d0b-0d6f7a1b2c3d",
    name: "Cheese",
    path: "Dairy / Cheese",
  },
  categoryId: "2a2a3a7c-6b0f-4f6e-9d0b-0d6f7a1b2c3d",
  createdAt: new Date("2023-01-02").toISOString(),
  description: "Product Description",
  expirationStatus: "EXPIRING",
  hasOpenLot: true,
  id: "074782ac-9605-4632-8459-3a82bb9e8d83",
  idealQuantity: 5,
  location: {
    archived: false,
    id: "3a2a3a7c-6b0f-4f6e-9d0b-0d6f7a1b2c3d",
    name: "Fridge",
  },
  locationId: "3a2a3a7c-6b0f-4f6e-9d0b-0d6f7a1b2c3d",
  lots: [apiLotMock],
  minQuantity: 1,
  nearestExpiration: "2026-11-15",
  needsRestock: false,
  notes: "Some notes about the product",
  openedShelfLifeDays: 5,
  owner: "FAMILY",
  ownerId: "7591aa82-a220-4a79-8802-15257b05ceb0",
  quantity: 3,
  restockQuantity: 2,
  stockOnly: false,
  unit: "kilogram",
  warnDaysClosed: 7,
  warnDaysOpened: 1,
};

export const apiItemMinimalMock = {
  barcode: null,
  brand: null,
  category: null,
  categoryId: null,
  createdAt: null,
  description: "Plain",
  expirationStatus: "NONE",
  hasOpenLot: false,
  id: "174782ac-9605-4632-8459-3a82bb9e8d83",
  idealQuantity: null,
  location: null,
  locationId: null,
  minQuantity: null,
  nearestExpiration: null,
  needsRestock: true,
  notes: null,
  openedShelfLifeDays: null,
  owner: "USER",
  ownerId: "7591aa82-a220-4a79-8802-15257b05ceb0",
  quantity: 0,
  restockQuantity: 1,
  stockOnly: false,
  unit: "unit",
  warnDaysClosed: 7,
  warnDaysOpened: 1,
};

// endregion mocks

function setup() {
  return StockModel.fromJSON(apiItemMock);
}

const spies = {};

const mocks = {
  json: apiItemMock,
  jsonMinimal: apiItemMinimalMock,
  lot: apiLotMock,
};

export { mocks, setup, spies };
