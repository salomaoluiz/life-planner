import StockAttentionDTO, {
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import StockAttentionUIModel from "./StockAttentionUIModel";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Silva", type: OwnerType.FAMILY }),
];

function build(
  daysLeft: number | undefined,
  unit?: StockUnits,
  ownerId?: string,
  restock = false,
) {
  let status = StockAttentionStatus.EXPIRING;

  if (restock) {
    status = StockAttentionStatus.RESTOCK;
  } else if (daysLeft !== undefined && daysLeft < 0) {
    status = StockAttentionStatus.EXPIRED;
  }

  const dto = new StockAttentionDTO({
    attentionCount: 1,
    items: [{ daysLeft, status, stock: stock(unit, ownerId) }],
    totalItems: 4,
  });

  return new StockAttentionUIModel(dto, owners).rows[0];
}

function stock(unit: StockUnits = StockUnits.UNIT, ownerId = "owner-1") {
  return dto((f) =>
    f
      .withId("stock-1")
      .withDescription("Milk")
      .withOwnerId(ownerId)
      .withQuantity(2)
      .withUnit(unit),
  );
}

it.each([
  [-1, { key: "home.stock.expired" }],
  [0, { key: "home.stock.expiresToday" }],
  [1, { key: "home.stock.expiresTomorrow" }],
  [2, { key: "home.stock.expiresIn", params: { count: 2 } }],
])("SHOULD build the badge for %s days left", (days, badge) => {
  expect(build(days).badge).toEqual(badge);
});

it("SHOULD flag expired rows only", () => {
  expect(build(-1).isExpired).toBe(true);
  expect(build(0).isExpired).toBe(false);
});

it("SHOULD expose the row fields and resolve the owner name", () => {
  const row = build(1);

  expect(row.id).toBe("stock-1");
  expect(row.title).toBe("Milk");
  expect(row.quantityText).toBe("2");
  expect(row.ownerName).toBe("Silva");
  expect(build(1, undefined, "other").ownerName).toBe("");
});

it.each(Object.values(StockUnits))(
  "SHOULD map the %s unit to its common key",
  (unit) => {
    expect(build(1, unit).unitKey).toBe(`common.units.${unit}`);
  },
);

it("SHOULD show kg and L below 1 as g and ml (spec 116)", () => {
  const row = new StockAttentionUIModel(
    new StockAttentionDTO({
      attentionCount: 1,
      items: [
        {
          daysLeft: 1,
          status: StockAttentionStatus.EXPIRING,
          stock: dto((f) => f.withQuantity(0.25).withUnit(StockUnits.KILOGRAM)),
        },
      ],
      totalItems: 1,
    }),
    owners,
  ).rows[0];

  expect(row.quantityText).toBe("250");
  expect(row.unitKey).toBe("common.units.gram");
});

it("SHOULD badge a low item as restock, without days", () => {
  const row = build(undefined, undefined, undefined, true);

  expect(row.badge).toEqual({ key: "home.stock.restock" });
  expect(row.isRestock).toBe(true);
  expect(row.isExpired).toBe(false);
  expect(build(1).isRestock).toBe(false);
});

it("SHOULD report empty stock only WHEN there are no items at all", () => {
  const model = new StockAttentionUIModel(
    new StockAttentionDTO({ attentionCount: 0, items: [], totalItems: 0 }),
    owners,
  );

  expect(model.isEmpty).toBe(true);
  expect(model.isNothingExpiring).toBe(false);
});

it("SHOULD report nothing expiring WHEN items exist but none need attention", () => {
  const model = new StockAttentionUIModel(
    new StockAttentionDTO({ attentionCount: 0, items: [], totalItems: 3 }),
    owners,
  );

  expect(model.isEmpty).toBe(false);
  expect(model.isNothingExpiring).toBe(true);
  expect(model.countLabelParams).toEqual({ count: 3 });
});

it("SHOULD expose the attention and total counts for the summary card", () => {
  const model = new StockAttentionUIModel(
    new StockAttentionDTO({ attentionCount: 4, items: [], totalItems: 12 }),
    [],
  );

  expect(model.attentionCount).toBe(4);
  expect(model.totalItems).toBe(12);
});
