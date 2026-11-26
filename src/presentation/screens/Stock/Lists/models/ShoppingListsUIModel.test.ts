import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  ShoppingListCardEntity,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import ShoppingListsUIModel, {
  LISTS_FILTER_ALL,
  LISTS_FILTER_PERSONAL,
} from "./ShoppingListsUIModel";

const owners = [
  new OwnerDTO({ id: "u", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "f", name: "Casa", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "x",
    name: "Old",
    type: OwnerType.FAMILY,
  }),
];

function card(
  id: string,
  extra: Partial<ShoppingListCardEntity> = {},
): ShoppingListCardEntity {
  return {
    autoCount: 0,
    currency: "BRL",
    estimatedTotalCents: 0,
    forecastCount: 0,
    id,
    isDefault: false,
    name: `List ${id}`,
    owner: "FAMILY",
    ownerId: "f",
    pricedCount: 0,
    purchaseIntervalDays: 7,
    rowCount: 0,
    status: ShoppingListStatuses.ACTIVE,
    ...extra,
  };
}

const cards = [
  card("m", { autoCount: 5, isDefault: true, rowCount: 12 }),
  card("p", { autoCount: 1, owner: "USER", ownerId: "u" }),
  card("a", { status: ShoppingListStatuses.ARCHIVED }),
  card("old", { ownerId: "x" }),
];
const model = new ShoppingListsUIModel(cards, owners);

it("SHOULD offer All, Personal and the active families only", () => {
  expect(model.filterOptions.map((option) => option.value)).toEqual([
    LISTS_FILTER_ALL,
    LISTS_FILTER_PERSONAL,
    "f",
  ]);
});

it("SHOULD split the active and the archived cards and hide an archived family", () => {
  const view = model.view(LISTS_FILTER_ALL);

  expect(view.active.map((row) => row.id)).toEqual(["m", "p"]);
  expect(view.archived.map((row) => row.id)).toEqual(["a"]);
  expect(view.active[0]).toMatchObject({ isDefault: true, ownerName: "Casa" });
  expect(view.active[1].ownerName).toBeUndefined();
});

it("SHOULD filter by Personal or by family AND fall back to All for an unknown filter", () => {
  expect(model.view(LISTS_FILTER_PERSONAL).active.map((row) => row.id)).toEqual(
    ["p"],
  );
  expect(model.view("f").active.map((row) => row.id)).toEqual(["m"]);
  expect(model.view("gone").filter).toBe(LISTS_FILTER_ALL);
  expect(model.view("f").filter).toBe("f");
});

it("SHOULD add the automatic rows of the active lists", () => {
  expect(model.autoRows).toBe(6);
});
