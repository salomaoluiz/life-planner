import { StockLotDTO } from "@application/dto/stock/StockDTO";
import StockMovementDTO from "@application/dto/stock/StockMovementDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import {
  StockMovementReasons,
  StockMovementTypes,
} from "@domain/entities/stock/StockMovementEntity";
import { dto, owners } from "@screens/Stock/models/stockUi.fixtures";

import StockItemDetailsUIModel from "./StockItemDetailsUIModel";

function lot(id: string, extra: Partial<StockLotDTO> = {}) {
  return {
    expirationStatus: StockLotStatus.OK,
    id,
    quantity: 1,
    ...extra,
  } as StockLotDTO;
}
function model(item = dto()) {
  return new StockItemDetailsUIModel(item, owners, "en-US");
}

describe("header and tiles", () => {
  it("SHOULD join brand, category path, location and owner", () => {
    const item = dto((f) =>
      f
        .withBrand("Brand")
        .withCategory({
          archived: false,
          id: "c",
          name: "Cheese",
          path: "Dairy / Cheese",
        })
        .withLocation({ archived: false, id: "l", name: "Fridge" }),
    );

    expect(model(item).headerLine).toBe(
      "Brand · Dairy › Cheese · Fridge · Ana",
    );
    expect(model(item).description).toBe(item.description);
    expect(model(item).ownerName).toBe("Ana");
  });

  it("SHOULD show total, minimum and ideal, days after opening and warning days", () => {
    const item = dto((f) =>
      f
        .withUnit(StockUnits.KILOGRAM)
        .withQuantity(1.5)
        .withMinQuantity(0.3, 1)
        .withOpenedShelfLifeDays(5),
    );
    const tiles = model(item).tiles;

    expect(tiles.map((tile) => tile.key)).toEqual([
      "total",
      "minIdeal",
      "afterOpening",
      "warnBefore",
    ]);
    expect(tiles[0].value).toEqual({
      quantities: [{ text: "1.5", unitKey: "common.units.kilogram" }],
    });
    expect(tiles[1].value).toEqual({
      quantities: [
        { text: "300", unitKey: "common.units.gram" },
        { text: "1", unitKey: "common.units.kilogram" },
      ],
    });
    expect(tiles[2].value).toEqual({
      key: "stock.details.days_other",
      params: { count: 5 },
    });
    expect(tiles[3].value).toEqual({
      key: "stock.details.warnValue",
      params: { closed: 7, opened: 1 },
    });
    expect(model(item).total.text).toBe("1.5");
  });

  it("SHOULD show 'not set' for a missing limit and shelf life, and the singular day", () => {
    const tiles = model(dto()).tiles;

    expect(tiles[1].value).toEqual({ key: "stock.details.notSet" });
    expect(tiles[2].value).toEqual({ key: "stock.details.notSet" });
    expect(
      model(dto((f) => f.withOpenedShelfLifeDays(1))).tiles[2].value,
    ).toMatchObject({ key: "stock.details.days_one" });
  });

  it("SHOULD report the restock quantity only WHEN the item needs it", () => {
    expect(model(dto()).restock).toBeUndefined();
    expect(model(dto((f) => f.withNeedsRestock())).restock).toEqual({
      text: "1",
      unitKey: "common.units.unit",
    });
  });
});

describe("lots", () => {
  function items(lots: StockLotDTO[]) {
    return model(dto((f) => f.withLots(lots).withOpenedShelfLifeDays(5))).lots;
  }

  it("SHOULD say when a lot expires, with its badges", () => {
    const rows = items([
      lot("open", {
        effectiveExpiration: new Date(2026, 10, 8),
        expirationDate: new Date(2026, 10, 30),
        expirationStatus: StockLotStatus.EXPIRING,
        openedAt: new Date(2026, 10, 3),
      }),
      lot("closed", {
        effectiveExpiration: new Date(2026, 11, 15),
        expirationDate: new Date(2026, 11, 15),
      }),
      lot("none"),
      lot("old", {
        effectiveExpiration: new Date(2026, 10, 2),
        expirationDate: new Date(2026, 10, 2),
        expirationStatus: StockLotStatus.EXPIRED,
      }),
    ]);

    expect(rows[0].subtitle.key).toBe("stock.lots.expiresOpened");
    expect(rows[0].subtitle.params).toMatchObject({ days: "5" });
    expect(rows[0].badges.map((badge) => badge.labelKey)).toEqual([
      "stock.lots.opened",
      "stock.badge.expiring",
    ]);
    expect(rows[1].subtitle.key).toBe("stock.lots.expires");
    expect(rows[1].canDiscard).toBe(false);
    expect(rows[2].subtitle).toEqual({
      key: "stock.lots.noExpiration",
      params: {},
    });
    expect(rows[3].subtitle.key).toBe("stock.lots.expiredAt");
    expect(rows[3].canDiscard).toBe(true);
    expect(rows[3].badges[0]).toEqual({
      labelKey: "stock.badge.expired",
      tone: "expense",
    });
  });

  it("SHOULD show a plain expiry for an open lot WHEN the shelf life does not shorten it", () => {
    const [row] = items([
      lot("open", {
        effectiveExpiration: new Date(2026, 10, 30),
        expirationDate: new Date(2026, 10, 30),
        openedAt: new Date(2026, 10, 3),
      }),
    ]);

    expect(row.subtitle.key).toBe("stock.lots.expires");
  });
});

describe("history", () => {
  function movement(
    type: StockMovementTypes,
    quantity: number,
    extra: Partial<StockMovementDTO> = {},
  ) {
    return {
      createdAt: new Date(2026, 10, 10, 8, 12),
      id: type,
      lotId: "l",
      quantity,
      type,
      ...extra,
    } as StockMovementDTO;
  }

  it("SHOULD sign the quantity, color the entries and keep the author or 'former member'", () => {
    const rows = model(dto((f) => f.withUnit(StockUnits.KILOGRAM))).history([
      movement(StockMovementTypes.ENTRY, 1.5, {
        reason: StockMovementReasons.PURCHASE,
        user: { id: "u", name: "Ana" },
      }),
      movement(StockMovementTypes.CONSUME, -0.25),
      movement(StockMovementTypes.OPEN, 1),
      movement(StockMovementTypes.ADJUST, -1),
    ]);

    expect(rows[0]).toMatchObject({
      isPositive: true,
      quantity: { sign: "+", text: "1.5", unitKey: "common.units.kilogram" },
      reasonKey: "stock.history.reason.purchase",
      titleKey: "stock.history.type.entry",
      user: "Ana",
    });
    expect(rows[1]).toMatchObject({
      isPositive: false,
      quantity: { sign: "−", text: "250", unitKey: "common.units.gram" },
      user: undefined,
    });
    expect(rows[2]).toMatchObject({
      isPositive: false,
      quantity: { sign: "" },
      titleKey: "stock.history.type.open",
    });
    expect(rows[3].quantity.sign).toBe("−");
    expect(rows[0].createdAt).toContain("11");
  });
});

describe("spec 123 forecast", () => {
  const now = new Date(2026, 10, 25);
  const forecast = {
    dailyRate: 0.571,
    emptyDate: new Date(2026, 11, 3),
    minDate: new Date(2026, 10, 28),
    status: "OK" as const,
    weeklyRate: 4,
  };

  function forecasted(extra: object = {}) {
    return Object.assign(dto(), { forecast, minQuantity: 3 }, extra);
  }
  function build(item: ReturnType<typeof dto>) {
    return new StockItemDetailsUIModel(item, owners, "en-US", now);
  }

  it("SHOULD show the weekly use, the days to the minimum and to zero with their dates", () => {
    const section = build(forecasted()).forecast;

    expect(section).toMatchObject({
      empty: {
        date: "12/03",
        days: { key: "stock.forecast.inDays_other", params: { count: 8 } },
      },
      kind: "ok",
      min: {
        date: "11/28",
        days: { key: "stock.forecast.inDays_other", params: { count: 3 } },
      },
    });
  });

  it("SHOULD say now WHEN the date is today AND keep a singular for one day", () => {
    const today = build(
      forecasted({ forecast: { ...forecast, minDate: now } }),
    ).forecast;
    const tomorrow = build(
      forecasted({
        forecast: { ...forecast, emptyDate: new Date(2026, 10, 26) },
      }),
    ).forecast;

    expect(today).toMatchObject({
      min: { days: { key: "stock.forecast.now" } },
    });
    expect(tomorrow).toMatchObject({
      empty: { days: { key: "stock.forecast.inDays_one" } },
    });
  });

  it("SHOULD explain a forecast without data OR without use, and hide it for a stock-only item", () => {
    expect(
      build(
        forecasted({ forecast: { ...forecast, status: "INSUFFICIENT_DATA" } }),
      ).forecast,
    ).toEqual({ kind: "insufficient" });
    expect(
      build(forecasted({ forecast: { ...forecast, status: "NO_CONSUMPTION" } }))
        .forecast,
    ).toEqual({ kind: "noConsumption" });
    expect(build(forecasted({ stockOnly: true })).forecast).toBeUndefined();
    expect(build(dto()).forecast).toBeUndefined();
  });

  it("SHOULD name the list of the forecast row AND the leftover lot with its quantities", () => {
    const item = forecasted({
      forecastRow: { listId: "l", listName: "Mercado", quantity: 6 },
      leftover: { date: new Date(2026, 10, 27), lotId: "a", quantity: 1 },
      lots: [lot("a", { quantity: 3 })],
    });
    const result = build(item);

    expect(result.forecastRow?.list).toBe("Mercado");
    expect(result.leftover).toMatchObject({ date: "11/27", lotId: "a" });
    expect(result.leftover?.lotQuantity.text).toBe("3");
    expect(result.leftover?.left.text).toBe("1");
  });

  it("SHOULD show the price per unit and tint the lot with a leftover, unless it was dismissed", () => {
    const item = forecasted({
      lots: [
        lot("a", { currency: "BRL", leftoverQuantity: 1, unitPriceCents: 489 }),
        lot("b", { leftoverDismissed: true, leftoverQuantity: 1 }),
        lot("c"),
      ],
    });
    const rows = build(item).lots;

    expect(rows[0].price?.text).toContain("4.89");
    expect(rows[0].leftover?.text).toBe("1");
    expect(rows[1].leftover).toBeUndefined();
    expect(rows[2].price).toBeUndefined();
  });

  it("SHOULD summarize the 90-day waste with one value per currency", () => {
    const item = forecasted({
      waste90d: {
        count: 1,
        mainReason: "EXPIRED",
        quantity: 2,
        totals: [{ currency: "BRL", valueCents: 978 }],
      },
    });
    const waste = build(item).waste;

    expect(waste?.reasonKey).toBe("stock.waste.reason.expired");
    expect(waste?.values[0]).toContain("9.78");
    expect(waste?.count).toBe(1);
  });

  it("SHOULD scale the weekly bars to the biggest week AND keep the excluded ones", () => {
    const chart = build(dto()).chart([
      { excluded: false, quantity: 4, start: new Date(2026, 8, 7) },
      { excluded: true, quantity: 0, start: new Date(2026, 8, 14) },
      { excluded: false, quantity: 2, start: new Date(2026, 8, 21) },
    ]);

    expect(chart.bars.map((bar) => bar.ratio)).toEqual([1, 0, 0.5]);
    expect(chart.bars[1].excluded).toBe(true);
    expect(chart.bars[2].weight).toBe(1);
    expect(chart.values).toBe("4, 0, 2");
  });
});
