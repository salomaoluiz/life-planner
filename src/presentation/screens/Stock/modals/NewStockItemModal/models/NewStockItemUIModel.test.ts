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

it("SHOULD build owner options in order with the personal label key", () => {
  const model = new NewStockItemUIModel([user, family]);

  expect(model.ownerOptions).toEqual([
    { label: "Ana", labelKey: "stock.list.filter.personal", value: "user-id" },
    { label: "Silva", value: "family-id" },
  ]);
});

it("SHOULD default to a valid preferred owner", () => {
  expect(
    new NewStockItemUIModel([user, family], "family-id").defaultOwnerId,
  ).toBe("family-id");
});

it("SHOULD fall back to the user owner WHEN the preferred id is unknown", () => {
  expect(new NewStockItemUIModel([family, user], "nope").defaultOwnerId).toBe(
    "user-id",
  );
});

it("SHOULD fall back to the first owner WHEN there is no user owner", () => {
  expect(new NewStockItemUIModel([family]).defaultOwnerId).toBe("family-id");
});

it("SHOULD NOT throw with empty owners", () => {
  const model = new NewStockItemUIModel([]);

  expect(model.ownerOptions).toEqual([]);
  expect(model.defaultOwnerId).toBe("");
});

it("SHOULD list the units in order", () => {
  expect(
    new NewStockItemUIModel([user]).unitOptions.map((unit) => unit.value),
  ).toEqual([
    StockUnits.UNIT,
    StockUnits.KILOGRAM,
    StockUnits.GRAM,
    StockUnits.LITER,
    StockUnits.MILLILITER,
  ]);
  expect(new NewStockItemUIModel([user]).unitOptions[1].labelKey).toBe(
    "stock.units.kilogram",
  );
});

it("SHOULD resolve the owner type and fall back to USER", () => {
  const model = new NewStockItemUIModel([user, family]);

  expect(model.ownerType("family-id")).toBe(StockOwners.FAMILY);
  expect(model.ownerType("user-id")).toBe(StockOwners.USER);
  expect(model.ownerType("unknown")).toBe(StockOwners.USER);
});
