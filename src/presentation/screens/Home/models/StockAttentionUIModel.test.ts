import StockAttentionDTO, {
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import StockAttentionUIModel from "./StockAttentionUIModel";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Silva", type: OwnerType.FAMILY }),
];

function build(daysLeft: number, unit?: StockUnits, ownerId?: string) {
  const status =
    daysLeft < 0 ? StockAttentionStatus.EXPIRED : StockAttentionStatus.EXPIRING;
  const dto = new StockAttentionDTO({
    attentionCount: 1,
    items: [{ daysLeft, status, stock: stock(unit, ownerId) }],
    totalItems: 4,
  });

  return new StockAttentionUIModel(dto, owners).rows[0];
}

function stock(unit: StockUnits = StockUnits.UNIT, ownerId = "owner-1") {
  return new StockDTO({
    description: "Milk",
    id: "stock-1",
    owner: StockOwners.FAMILY,
    ownerId,
    quantity: 2,
    unit,
  });
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
  expect(row.quantity).toBe(2);
  expect(row.ownerName).toBe("Silva");
  expect(build(1, undefined, "other").ownerName).toBe("");
});

it.each(Object.values(StockUnits))(
  "SHOULD map the %s unit to its common key",
  (unit) => {
    expect(build(1, unit).unitKey).toBe(`common.units.${unit}`);
  },
);

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
