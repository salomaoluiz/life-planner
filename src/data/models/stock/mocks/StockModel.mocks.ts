import StockModel from "../StockModel";

// region mocks

const jsonMock = {
  barcode: "1234567890123",
  brand: "BrandName",
  description: "Product Description",
  expiration_date: new Date("2025-05-11").toISOString(),
  id: "074782ac-9605-4632-8459-3a82bb9e8d83",
  notes: "Some notes about the product",
  opening_date: new Date("2023-01-01").toISOString(),
  owner: "FAMILY",
  owner_id: "7591aa82-a220-4a79-8802-15257b05ceb0",
  purchase_date: new Date("2023-01-01").toISOString(),
  quantity: 10,
  status: "ACTIVE",
  unit: "KG",
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
    description: jsonMock.description,
    expirationDate: new Date(jsonMock.expiration_date),
    id: jsonMock.id,
    notes: jsonMock.notes,
    openingDate: new Date(jsonMock.opening_date),
    owner: jsonMock.owner,
    ownerId: jsonMock.owner_id,
    purchaseDate: new Date(jsonMock.purchase_date),
    quantity: jsonMock.quantity,
    status: jsonMock.status,
    unit: jsonMock.unit,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
