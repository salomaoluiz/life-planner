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

describe("spec 123 forecast", () => {
  const json = {
    ...mocks.json,
    forecast: {
      computedOn: "2026-11-25",
      dailyRate: 0.571,
      emptyDate: "2026-12-03",
      minDate: "2026-11-28",
      status: "OK",
      weeklyRate: 4,
    },
    forecastRow: { listId: "l", listName: "Mercado", quantity: 6 },
    hasForecastRow: true,
    leftover: { date: "2026-11-27", lotId: "lot", quantity: 1 },
    waste90d: {
      count: 1,
      mainReason: "EXPIRED",
      quantity: 2,
      totals: [{ currency: "BRL", valueCents: 978 }],
    },
  };

  it("SHOULD read the forecast, the forecast row, the leftover and the 90-day waste", () => {
    const model = StockModel.fromJSON(json);

    expect(model.forecast).toMatchObject({
      dailyRate: 0.571,
      status: "OK",
      weeklyRate: 4,
    });
    expect(model.forecast?.minDate?.getDate()).toBe(28);
    expect(model.forecastRow).toEqual({
      listId: "l",
      listName: "Mercado",
      quantity: 6,
    });
    expect(model.hasForecastRow).toBe(true);
    expect(model.leftover?.lotId).toBe("lot");
    expect(model.waste90d?.totals).toEqual([
      { currency: "BRL", valueCents: 978 },
    ]);
  });

  it("SHOULD round-trip the forecast through toJSON (the list cache)", () => {
    const again = StockModel.fromJSON(
      StockModel.fromJSON(json).toJSON() as Record<string, unknown>,
    );

    expect(again.forecast).toMatchObject({ status: "OK", weeklyRate: 4 });
    expect(again.leftover?.quantity).toBe(1);
    expect(again.hasForecastRow).toBe(true);
  });

  it("SHOULD have no forecast WHEN the API sends null", () => {
    const model = StockModel.fromJSON({
      ...mocks.json,
      forecast: null,
      leftover: null,
    });

    expect(model.forecast).toBeUndefined();
    expect(model.leftover).toBeUndefined();
    expect(model.hasForecastRow).toBe(false);
  });
});
