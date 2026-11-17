import { mocks, setup } from "./mocks/StockModel.mocks";
import StockModel from "./StockModel";

it("SHOULD read every field of the API shape, days as local calendar days AND the lots of the detail", () => {
  const result = setup();

  expect(result).toMatchObject({
    barcode: mocks.json.barcode,
    brand: mocks.json.brand,
    category: mocks.json.category,
    categoryId: mocks.json.categoryId,
    description: mocks.json.description,
    expirationStatus: "EXPIRING",
    hasOpenLot: true,
    id: mocks.json.id,
    idealQuantity: 5,
    location: mocks.json.location,
    minQuantity: 1,
    needsRestock: false,
    openedShelfLifeDays: 5,
    owner: "FAMILY",
    quantity: 3,
    restockQuantity: 2,
    stockOnly: false,
    unit: "kilogram",
    warnDaysClosed: 7,
    warnDaysOpened: 1,
  });
  expect(result.nearestExpiration).toEqual(new Date(2026, 10, 15));
  expect(result.createdAt).toEqual(new Date(mocks.json.createdAt));
  expect(result.lots?.[0]).toMatchObject({
    expirationStatus: "EXPIRING",
    quantity: 1.5,
  });
  expect(result.lots?.[0].openedAt).toEqual(new Date(2026, 10, 10));
});

it("SHOULD leave every null of the API undefined", () => {
  const result = StockModel.fromJSON(mocks.jsonMinimal);

  expect(result.barcode).toBeUndefined();
  expect(result.category).toBeUndefined();
  expect(result.createdAt).toBeUndefined();
  expect(result.idealQuantity).toBeUndefined();
  expect(result.location).toBeUndefined();
  expect(result.minQuantity).toBeUndefined();
  expect(result.nearestExpiration).toBeUndefined();
  expect(result.lots).toBeUndefined();
  expect(result.openedShelfLifeDays).toBeUndefined();
});

it("SHOULD toJSON the list shape (no lots, calendar days) AND round-trip through fromJSON", () => {
  const json = setup().toJSON();

  expect(json).not.toHaveProperty("lots");
  expect(json.nearestExpiration).toBe("2026-11-15");
  expect(json.category).toEqual(mocks.json.category);
  expect(StockModel.fromJSON(json).toJSON()).toEqual(json);
});

it("SHOULD write nulls for the absent optionals", () => {
  expect(StockModel.fromJSON(mocks.jsonMinimal).toJSON()).toMatchObject({
    barcode: null,
    category: null,
    createdAt: null,
    nearestExpiration: null,
  });
});
