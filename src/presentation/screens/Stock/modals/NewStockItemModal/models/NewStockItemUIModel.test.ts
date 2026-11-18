import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewStockItemUIModel from "./NewStockItemUIModel";

const user = new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER });
const family = new OwnerDTO({
  id: "family-id",
  name: "Silva",
  type: OwnerType.FAMILY,
});

describe("defaultOwnerId", () => {
  it("SHOULD prefer the preferred owner, then the user, then the first owner", () => {
    expect(
      new NewStockItemUIModel([user, family], "family-id").defaultOwnerId,
    ).toBe("family-id");
    expect(
      new NewStockItemUIModel([family, user], "ghost").defaultOwnerId,
    ).toBe("user-id");
    expect(new NewStockItemUIModel([family]).defaultOwnerId).toBe("family-id");
    expect(new NewStockItemUIModel([]).defaultOwnerId).toBe("");
  });
});

it("SHOULD offer Unidade, Peso and Volume AND recognize only them", () => {
  const model = new NewStockItemUIModel([user]);

  expect(model.unitOptions.map((option) => option.value)).toEqual([
    StockUnits.UNIT,
    StockUnits.KILOGRAM,
    StockUnits.LITER,
  ]);
  expect(model.isUnit("kilogram")).toBe(true);
  expect(model.isUnit("gram")).toBe(false);
});

it("SHOULD label the personal owner and name the families", () => {
  const model = new NewStockItemUIModel([user, family]);

  expect(model.ownerOptions).toEqual([
    { label: "Ana", labelKey: "stock.list.filter.personal", value: "user-id" },
    { label: "Silva", value: "family-id" },
  ]);
  expect(model.ownerName("family-id")).toBe("Silva");
  expect(model.ownerName("ghost")).toBe("");
  expect(model.ownerType("family-id")).toBe(StockOwners.FAMILY);
  expect(model.ownerType("user-id")).toBe(StockOwners.USER);
});
