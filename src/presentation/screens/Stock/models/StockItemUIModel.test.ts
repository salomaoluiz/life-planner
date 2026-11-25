import {
  StockExpirationStatus,
  StockUnits,
} from "@domain/entities/stock/StockEntity";

import StockItemUIModel, { normalizeSearchText } from "./StockItemUIModel";
import { dto, expired, expiring, fine, low, owners } from "./stockUi.fixtures";

function model(item = dto()) {
  return new StockItemUIModel(item, owners, "en-US");
}

describe("badges", () => {
  it("SHOULD show Vencido for an expired item and Vencendo for an expiring one", () => {
    expect(model(expired("a")).badges).toEqual([
      { labelKey: "stock.badge.expired", tone: "expense" },
    ]);
    expect(model(expiring("a")).badges).toEqual([
      { labelKey: "stock.badge.expiring", tone: "warning" },
    ]);
  });

  it("SHOULD show Repor and Aberto, in that order after the expiration badge", () => {
    const item = dto((f) =>
      f
        .withExpirationStatus(StockExpirationStatus.EXPIRING)
        .withNeedsRestock()
        .withHasOpenLot(),
    );

    expect(model(item).badges.map((badge) => badge.labelKey)).toEqual([
      "stock.badge.expiring",
      "stock.badge.restock",
      "stock.badge.opened",
    ]);
  });

  it("SHOULD show no badge for an item in order", () => {
    expect(model(fine("a")).badges).toEqual([]);
  });
});

describe("attention", () => {
  it.each([
    ["expired", expired("a"), true],
    ["expiring", expiring("a"), true],
    ["low", low("a"), true],
    ["fine", fine("a"), false],
  ])("SHOULD flag a %s item as attention = %s", (_label, item, expected) => {
    expect(model(item).isAttention).toBe(expected);
  });
});

describe("quantity", () => {
  it.each([
    [0.25, StockUnits.KILOGRAM, "250", "common.units.gram"],
    [1.5, StockUnits.KILOGRAM, "1.5", "common.units.kilogram"],
    [3, StockUnits.UNIT, "3", "common.units.unit"],
  ])("SHOULD show %s of %s as %s %s", (quantity, unit, text, unitKey) => {
    expect(
      model(dto((f) => f.withQuantity(quantity).withUnit(unit))).quantity,
    ).toEqual({ text, unitKey });
  });
});

describe("dateInfo", () => {
  it("SHOULD say when the nearest expiration is, expired or not, opened or not", () => {
    expect(model(expired("a")).dateInfo).toMatchObject({
      key: "stock.list.date.expired",
    });
    expect(model(expiring("a")).dateInfo).toMatchObject({
      key: "stock.list.date.expires",
    });
    expect(
      model(
        dto((f) =>
          f.withNearestExpiration(new Date(2026, 10, 5)).withHasOpenLot(),
        ),
      ).dateInfo,
    ).toMatchObject({
      key: "stock.list.date.openedExpires",
    });
  });

  it("SHOULD show the minimum WHEN the item only needs restock", () => {
    expect(model(low("a")).dateInfo).toEqual({
      key: "stock.list.date.minimum",
      minimum: { text: "300", unitKey: "common.units.gram" },
    });
  });

  it("SHOULD show nothing WHEN there is no date and no restock", () => {
    expect(model(dto()).dateInfo).toBeUndefined();
  });
});

describe("presentation", () => {
  it("SHOULD build the subtitle from the category path, the location and the owner", () => {
    const item = dto((f) =>
      f
        .withCategory({
          archived: false,
          id: "c",
          name: "Cheese",
          path: "Dairy / Cheese",
        })
        .withLocation({ archived: false, id: "l", name: "Fridge" }),
    );

    expect(model(item).subtitle).toBe("Dairy › Cheese · Fridge · Ana");
    expect(model(dto()).subtitle).toBe("Ana");
  });

  it.each([
    [expired("a"), "alert-circle-outline", "expense"],
    [expiring("a"), "clock-outline", "warning"],
    [low("a"), "cart-outline", "accent"],
    [fine("a"), "package-variant-closed", "neutral"],
  ])("SHOULD pick the icon tile", (item, icon, tone) => {
    expect(model(item).iconTile).toEqual({ icon, tone });
  });

  it("SHOULD expose the ids, times, owner and search text", () => {
    const item = dto((f) =>
      f
        .withBrand("Açaí Brand")
        .withBarcode("789")
        .withCreatedAt(new Date(2026, 0, 1))
        .withNearestExpiration(new Date(2026, 10, 5)),
    );
    const ui = model(item);

    expect(ui.id).toBe(item.id);
    expect(ui.brand).toBe("Açaí Brand");
    expect(ui.description).toBe(item.description);
    expect(ui.createdTime).toBe(new Date(2026, 0, 1).getTime());
    expect(ui.expirationTime).toBe(new Date(2026, 10, 5).getTime());
    expect(ui.ownerName).toBe("Ana");
    expect(ui.ownerKind).toBe(item.owner);
    expect(ui.categoryId).toBeUndefined();
    expect(ui.locationId).toBeUndefined();
    expect(ui.searchText).toContain("acai brand");
    expect(ui.searchText).toContain("789");
    expect(ui.status).toBe(StockExpirationStatus.NONE);
  });

  it("SHOULD have an empty owner name for an unknown owner", () => {
    expect(
      new StockItemUIModel(
        dto((f) => f.withOwnerId("ghost")),
        owners,
      ).ownerName,
    ).toBe("");
  });

  it("SHOULD normalize text for the search", () => {
    expect(normalizeSearchText("  Muçarela ")).toBe("mucarela");
  });
});

describe("spec 123 badges", () => {
  const now = new Date(2026, 10, 25);
  const forecast = {
    dailyRate: 0.5,
    emptyDate: new Date(2026, 11, 5),
    minDate: new Date(2026, 10, 28),
    status: "OK" as const,
    weeklyRate: 3.5,
  };

  function build(extra: object) {
    return new StockItemUIModel(
      Object.assign(dto(), extra),
      owners,
      "en-US",
      now,
    );
  }

  it("SHOULD show Acaba em only for an item with a forecast row, and send it to attention", () => {
    const row = build({ forecast, hasForecastRow: true });
    const comfortable = build({ forecast, hasForecastRow: false });

    expect(row.badges.map((badge) => badge.labelKey)).toContain(
      "stock.forecast.badge_other",
    );
    expect(row.badges.find((badge) => badge.params)?.params).toEqual({
      count: 10,
    });
    expect(row.isAttention).toBe(true);
    expect(comfortable.badges.map((badge) => badge.labelKey)).not.toContain(
      "stock.forecast.badge_other",
    );
    expect(comfortable.isAttention).toBe(false);
  });

  it("SHOULD show Sobra with the quantity and the day for a leftover, and send it to attention", () => {
    const item = build({
      leftover: { date: new Date(2026, 10, 27), lotId: "a", quantity: 1 },
    });
    const badge = item.badges.find(
      (candidate) => candidate.labelKey === "stock.leftover.badge",
    );

    expect(badge?.params).toMatchObject({ date: "27", quantity: "1" });
    expect(badge?.tone).toBe("expense");
    expect(item.isAttention).toBe(true);
  });
});
