import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewStockItemViewModel from "./NewStockItemViewModel";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function setup() {
  return new NewStockItemViewModel({ stockOwnersDTO: owners });
}

it("SHOULD map owners to picker items", () => {
  expect(setup().stockOwners).toEqual([
    { label: "USER - Alice Test", value: "owner-1" },
    { label: "FAMILY - Test Family", value: "owner-2" },
  ]);
});

it("SHOULD list every stock unit with its label", () => {
  expect(setup().stockUnits).toEqual([
    { label: "Gram", value: StockUnits.GRAM },
    { label: "Kilogram", value: StockUnits.KILOGRAM },
    { label: "Liter", value: StockUnits.LITER },
    { label: "Milliliter", value: StockUnits.MILLILITER },
    { label: "Unit", value: StockUnits.UNIT },
  ]);
});

it.each([
  ["owner-1", StockOwners.USER],
  ["owner-2", StockOwners.FAMILY],
])("SHOULD resolve the owner type WHEN owner id is %s", (id, expected) => {
  expect(setup().stockOwnerType(id)).toBe(expected);
});
