import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { StockExpirationStatus } from "@domain/entities/stock/stockExpiration";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import StockItemUIModel, { normalizeSearchText } from "./StockItemUIModel";

const now = new Date(2026, 9, 5, 12);
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({
    id: "family-id",
    name: "Test Family",
    type: OwnerType.FAMILY,
  }),
];

function build(
  params: Partial<ConstructorParameters<typeof StockDTO>[0]> = {},
) {
  return new StockItemUIModel(
    new StockDTO({
      description: "Milk",
      id: "stock-id",
      owner: StockOwners.USER,
      ownerId: "user-id",
      quantity: 5,
      unit: StockUnits.KILOGRAM,
      ...params,
    }),
    owners,
    now,
    "en-US",
  );
}

describe("StockItemUIModel", () => {
  it("SHOULD flag an expired item as attention with the expense tile", () => {
    const item = build({ expirationDate: new Date(2026, 9, 1) });

    expect(item.status).toBe(StockExpirationStatus.EXPIRED);
    expect(item.isAttention).toBe(true);
    expect(item.iconTile).toEqual({
      icon: "alert-circle-outline",
      tone: "expense",
    });
    expect(item.badge).toEqual({
      labelKey: "stock.status.expired",
      tone: "expense",
    });
    expect(item.dateInfo?.key).toBe("stock.list.date.expired");
  });

  it("SHOULD show the today badge for an item expiring today", () => {
    const item = build({ expirationDate: new Date(2026, 9, 5) });

    expect(item.badge).toEqual({
      labelKey: "stock.status.today",
      tone: "warning",
    });
    expect(item.iconTile).toEqual({ icon: "clock-outline", tone: "warning" });
    expect(item.dateInfo?.key).toBe("stock.list.date.expires");
  });

  it("SHOULD show the tomorrow badge", () => {
    const item = build({ expirationDate: new Date(2026, 9, 6) });

    expect(item.badge?.labelKey).toBe("stock.status.tomorrow");
  });

  it("SHOULD show the days badge with a count", () => {
    const item = build({ expirationDate: new Date(2026, 9, 7) });

    expect(item.badge).toEqual({
      labelKey: "stock.status.days",
      params: { count: 2 },
      tone: "warning",
    });
  });

  it("SHOULD have no badge and the opened date for an OK opened item", () => {
    const item = build({ openingDate: new Date(2026, 9, 1) });

    expect(item.badge).toBeUndefined();
    expect(item.isAttention).toBe(false);
    expect(item.iconTile).toEqual({
      icon: "package-variant-closed",
      tone: "neutral",
    });
    expect(item.dateInfo?.key).toBe("stock.list.date.opened");
  });

  it("SHOULD have no date info for an OK item without opening date", () => {
    expect(build().dateInfo).toBeUndefined();
  });

  it("SHOULD expose quantity and unit keys", () => {
    const item = build();

    expect(item.quantityText).toBe("5");
    expect(item.unitKey).toBe("common.units.kilogram");
    expect(item.quantityDetail).toEqual({
      unitKey: "stock.units.kilogram",
      value: 5,
    });
  });

  it("SHOULD resolve the owner name and kind", () => {
    expect(build().ownerName).toBe("Alice Test");
    expect(build().ownerKind).toBe(StockOwners.USER);
    expect(build({ ownerId: "gone-id" }).ownerName).toBe("");
  });

  it("SHOULD list only filled detail rows in order", () => {
    const item = build({ brand: "Brand X", notes: "Fridge" });

    expect(item.detailRows).toEqual([
      { labelKey: "stock.details.owner", value: "Alice Test" },
      { labelKey: "stock.details.brand", value: "Brand X" },
      { labelKey: "stock.details.notes", value: "Fridge" },
    ]);
  });

  it("SHOULD list every detail row with formatted dates", () => {
    const item = build({
      barcode: "123",
      brand: "B",
      expirationDate: new Date(2026, 9, 1),
      notes: "N",
      openingDate: new Date(2026, 9, 2),
      purchaseDate: new Date(2026, 9, 3),
    });

    expect(item.detailRows.map((row) => row.labelKey)).toEqual([
      "stock.details.owner",
      "stock.details.expiration",
      "stock.details.opening",
      "stock.details.purchase",
      "stock.details.brand",
      "stock.details.barcode",
      "stock.details.notes",
    ]);
    expect(item.detailRows[1].value).toBe(
      new Date(2026, 9, 1).toLocaleDateString("en-US"),
    );
    expect(item.detailRows[1].value).toBe("10/1/2026");
  });

  it("SHOULD build normalized search text from description and brand", () => {
    const item = build({ brand: "União", description: "Açúcar" });

    expect(item.searchText).toContain("acucar");
    expect(item.searchText).toContain("uniao");
  });

  it("SHOULD expose times and basic fields", () => {
    const item = build({
      createdAt: new Date(2026, 8, 1),
      expirationDate: new Date(2026, 9, 20),
    });

    expect(item.id).toBe("stock-id");
    expect(item.ownerId).toBe("user-id");
    expect(item.description).toBe("Milk");
    expect(item.expirationTime).toBe(new Date(2026, 9, 20).getTime());
    expect(item.createdTime).toBe(new Date(2026, 8, 1).getTime());
  });
});

describe("normalizeSearchText", () => {
  it("SHOULD trim, lowercase and strip accents", () => {
    expect(normalizeSearchText("  CAFÉ ")).toBe("cafe");
  });

  it("SHOULD handle decomposed input", () => {
    expect(normalizeSearchText("Café")).toBe("cafe");
  });
});
