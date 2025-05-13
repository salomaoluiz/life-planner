import { mocks, setup } from "./mocks/StockModel.mocks";
import StockModel from "./StockModel";

it("SHOULD the StockModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("barcode", mocks.json.barcode);
  expect(result).toHaveProperty("brand", mocks.json.brand);
  expect(result).toHaveProperty("description", mocks.json.description);
  expect(result).toHaveProperty(
    "expirationDate",
    new Date(mocks.json.expiration_date),
  );
  expect(result).toHaveProperty("notes", mocks.json.notes);
  expect(result).toHaveProperty(
    "openingDate",
    new Date(mocks.json.opening_date),
  );
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.owner_id);
  expect(result).toHaveProperty(
    "purchaseDate",
    new Date(mocks.json.purchase_date),
  );
  expect(result).toHaveProperty("quantity", mocks.json.quantity);
  expect(result).toHaveProperty("status", mocks.json.status);
  expect(result).toHaveProperty("unit", mocks.json.unit);
});

it("SHOULD the StockModel fromJson create a new StockModel", () => {
  const modelFromJson = StockModel.fromJSON({
    barcode: mocks.json.barcode,
    brand: mocks.json.brand,
    description: mocks.json.description,
    expiration_date: mocks.json.expiration_date,
    id: mocks.json.id,
    notes: mocks.json.notes,
    opening_date: mocks.json.opening_date,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    purchase_date: mocks.json.purchase_date,
    quantity: mocks.json.quantity,
    status: mocks.json.status,
    unit: mocks.json.unit,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the StockModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
