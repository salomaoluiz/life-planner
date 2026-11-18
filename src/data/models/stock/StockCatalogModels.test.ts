import {
  StockCategoryModel,
  StockLocationModel,
  StockOwnerChangePreviewModel,
  StockSuggestionModel,
} from "./StockCatalogModels";
import StockLotModel from "./StockLotModel";
import StockMovementModel from "./StockMovementModel";

it("SHOULD read a category tree with its mapping and counts", () => {
  const tree = StockCategoryModel.fromJSON({
    children: [
      {
        id: "c",
        itemCount: 2,
        name: "Cheese",
        parentId: "p",
        status: "ACTIVE",
      },
    ],
    effectiveFinanceCategoryId: "f",
    financeCategoryId: "f",
    id: "p",
    itemCount: 1,
    name: "Dairy",
    parentId: null,
    status: "ACTIVE",
  });

  expect(tree).toMatchObject({
    effectiveFinanceCategoryId: "f",
    financeCategoryId: "f",
    itemCount: 1,
    parentId: undefined,
  });
  expect(tree.children[0]).toMatchObject({ id: "c", parentId: "p" });
  expect(
    StockCategoryModel.fromJSON({ id: "x", name: "N", status: "ARCHIVED" }),
  ).toMatchObject({ children: [], itemCount: 0 });
});

it("SHOULD read locations, suggestions and the owner change preview", () => {
  expect(
    StockLocationModel.fromJSON({
      id: "l",
      itemCount: 3,
      name: "Pantry",
      status: "ACTIVE",
    }),
  ).toMatchObject({ itemCount: 3 });
  expect(
    StockLocationModel.fromJSON({ id: "l", name: "Pantry", status: "ACTIVE" })
      .itemCount,
  ).toBe(0);
  expect(
    StockSuggestionModel.fromJSON({
      brand: null,
      description: "Milk",
      id: "s",
      quantity: 2,
      score: 0.9,
      unit: "liter",
    }),
  ).toMatchObject({ brand: undefined, score: 0.9 });
  expect(
    StockOwnerChangePreviewModel.fromJSON({
      category: { from: "Dairy", to: null },
      location: { from: "Fridge", to: "Fridge" },
    }),
  ).toMatchObject({
    category: { from: "Dairy", to: undefined },
    location: { to: "Fridge" },
  });
  expect(StockOwnerChangePreviewModel.fromJSON({})).toMatchObject({
    category: {},
    location: {},
  });
});

it("SHOULD read lots and movements, the author only while a member", () => {
  expect(
    StockLotModel.fromJSON({
      effectiveExpiration: null,
      expirationDate: null,
      expirationStatus: "NONE",
      id: "l",
      openedAt: null,
      purchaseDate: null,
      quantity: 2,
    }),
  ).toMatchObject({ effectiveExpiration: undefined, quantity: 2 });

  const movement = StockMovementModel.fromJSON({
    createdAt: "2026-11-10T12:00:00.000Z",
    id: "m",
    lotId: "l",
    note: "n",
    quantity: -1,
    reason: "EXPIRED",
    type: "DISCARD",
    user: { id: "u", name: "Ana" },
  });

  expect(movement).toMatchObject({
    note: "n",
    reason: "EXPIRED",
    user: { id: "u", name: "Ana" },
  });
  expect(
    StockMovementModel.fromJSON({
      createdAt: "2026-11-10T12:00:00.000Z",
      id: "m",
      lotId: "l",
      note: null,
      quantity: 1,
      reason: null,
      type: "ENTRY",
      user: null,
    }),
  ).toMatchObject({ note: undefined, reason: undefined, user: undefined });
});
