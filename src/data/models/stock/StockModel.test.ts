import { mocks, setup } from "./mocks/StockModel.mocks";
import StockModel from "./StockModel";

const nullOptionals = {
  barcode: null,
  brand: null,
  expirationDate: null,
  notes: null,
  openingDate: null,
  purchaseDate: null,
};

it("SHOULD the StockModel has all params AND no status", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("barcode", mocks.json.barcode);
  expect(result).toHaveProperty("brand", mocks.json.brand);
  expect(result).toHaveProperty("description", mocks.json.description);
  expect(result).toHaveProperty(
    "expirationDate",
    new Date(mocks.json.expirationDate),
  );
  expect(result).toHaveProperty("notes", mocks.json.notes);
  expect(result).toHaveProperty(
    "openingDate",
    new Date(mocks.json.openingDate),
  );
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.ownerId);
  expect(result).toHaveProperty(
    "purchaseDate",
    new Date(mocks.json.purchaseDate),
  );
  expect(result).toHaveProperty("quantity", mocks.json.quantity);
  expect(result).toHaveProperty("unit", mocks.json.unit);
  expect(result).not.toHaveProperty("status");
});

it("SHOULD fromJSON create a StockModel from the API shape (extra API fields are ignored)", () => {
  const model = StockModel.fromJSON({
    ...mocks.json,
    updatedAt: "2026-09-30T12:01:00.000Z",
  });

  expect(model).toStrictEqual(setup());
});

it("SHOULD fromJSON turn API null optionals into undefined", () => {
  const model = StockModel.fromJSON({ ...mocks.json, ...nullOptionals });

  expect(model.barcode).toBeUndefined();
  expect(model.brand).toBeUndefined();
  expect(model.expirationDate).toBeUndefined();
  expect(model.notes).toBeUndefined();
  expect(model.openingDate).toBeUndefined();
  expect(model.purchaseDate).toBeUndefined();
});

it("SHOULD toJSON return the camelCase API shape with ISO dates", () => {
  expect(setup().toJSON()).toStrictEqual(mocks.json);
});

it("SHOULD toJSON serialize absent optionals as null", () => {
  const model = StockModel.fromJSON({ ...mocks.json, ...nullOptionals });

  expect(model.toJSON()).toMatchObject(nullOptionals);
});

it("SHOULD survive a toJSON -> fromJSON cache round trip", () => {
  const original = setup();

  expect(StockModel.fromJSON(original.toJSON())).toStrictEqual(original);
});

it("SHOULD fromJSON read createdAt as a Date", () => {
  expect(StockModel.fromJSON(mocks.json).createdAt).toStrictEqual(
    new Date(mocks.json.createdAt),
  );
});

it("SHOULD fromJSON leave createdAt undefined WHEN the cache entry has none", () => {
  const withoutCreatedAt: Record<string, unknown> = { ...mocks.json };
  delete withoutCreatedAt.createdAt;

  expect(StockModel.fromJSON(withoutCreatedAt).createdAt).toBeUndefined();
});

it("SHOULD toJSON write createdAt as ISO or null", () => {
  expect(setup().toJSON().createdAt).toBe(mocks.json.createdAt);
  expect(
    StockModel.fromJSON({ ...mocks.json, createdAt: null }).toJSON().createdAt,
  ).toBeNull();
});
