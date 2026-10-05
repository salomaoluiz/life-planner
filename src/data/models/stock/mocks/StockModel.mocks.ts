import StockModel from "../StockModel";

// region mocks

const jsonMock = {
  barcode: "1234567890123",
  brand: "BrandName",
  createdAt: new Date("2023-01-02").toISOString(),
  description: "Product Description",
  expirationDate: new Date("2025-05-11").toISOString(),
  id: "074782ac-9605-4632-8459-3a82bb9e8d83",
  notes: "Some notes about the product",
  openingDate: new Date("2023-01-01").toISOString(),
  owner: "FAMILY",
  ownerId: "7591aa82-a220-4a79-8802-15257b05ceb0",
  purchaseDate: new Date("2023-01-01").toISOString(),
  quantity: 10,
  unit: "kilogram",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new StockModel({
    barcode: jsonMock.barcode,
    brand: jsonMock.brand,
    createdAt: new Date(jsonMock.createdAt),
    description: jsonMock.description,
    expirationDate: new Date(jsonMock.expirationDate),
    id: jsonMock.id,
    notes: jsonMock.notes,
    openingDate: new Date(jsonMock.openingDate),
    owner: jsonMock.owner,
    ownerId: jsonMock.ownerId,
    purchaseDate: new Date(jsonMock.purchaseDate),
    quantity: jsonMock.quantity,
    unit: jsonMock.unit,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

export { mocks, setup, spies };
