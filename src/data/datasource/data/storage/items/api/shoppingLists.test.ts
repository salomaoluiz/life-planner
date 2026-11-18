import { GenericError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import {
  addShoppingListRow,
  createShoppingList,
  deleteShoppingListRow,
  getRestockSummary,
  getShoppingList,
  getShoppingLists,
  updateShoppingList,
  updateShoppingListRow,
} from "./shoppingLists";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

const spies = {
  delete: jest.mocked(api.delete),
  get: jest.mocked(api.get),
  patch: jest.mocked(api.patch),
  post: jest.mocked(api.post),
};

beforeEach(() => {
  jest.resetAllMocks();
});

const list = {
  currency: "BRL",
  id: "l",
  isDefault: false,
  name: "Pharmacy",
  owner: "USER",
  ownerId: "o",
  status: "ACTIVE",
};
const row = {
  description: "Milk",
  id: "r",
  origin: "MANUAL",
  priceSource: "NONE",
  quantity: 2,
  unit: "unit",
};

it("SHOULD GET the cards (owner and archived on request) and the restock summary", async () => {
  spies.get.mockResolvedValueOnce({ items: [list] });
  spies.get.mockResolvedValueOnce({ items: [] });
  spies.get.mockResolvedValueOnce({ count: 0 });

  expect(await getShoppingLists({})).toHaveLength(1);
  await getShoppingLists({ includeArchived: true, ownerId: "o 1" });
  await getRestockSummary();

  expect(spies.get).toHaveBeenNthCalledWith(1, "/v1/stock/shopping-lists");
  expect(spies.get).toHaveBeenNthCalledWith(
    2,
    "/v1/stock/shopping-lists?ownerId=o+1&includeArchived=true",
  );
  expect(spies.get).toHaveBeenNthCalledWith(
    3,
    "/v1/stock/shopping-lists/restock-summary",
  );
});

it("SHOULD GET one list", async () => {
  spies.get.mockResolvedValueOnce({
    groups: [],
    list,
    totals: { estimatedTotalCents: 0 },
  });

  expect((await getShoppingList("l/1")).list.id).toBe("l");
  expect(spies.get).toHaveBeenCalledWith("/v1/stock/shopping-lists/l%2F1");
});

it("SHOULD create and update lists", async () => {
  spies.post.mockResolvedValueOnce(list);
  spies.patch.mockResolvedValueOnce(list);

  await createShoppingList({ name: "Pharmacy", owner: "USER", ownerId: "o" });
  await updateShoppingList({ id: "l", status: "ARCHIVED" });

  expect(spies.post).toHaveBeenCalledWith("/v1/stock/shopping-lists", {
    name: "Pharmacy",
    owner: "USER",
    ownerId: "o",
  });
  expect(spies.patch).toHaveBeenCalledWith("/v1/stock/shopping-lists/l", {
    status: "ARCHIVED",
  });
});

it("SHOULD add, update and delete rows (the list id travels in the path, not the body)", async () => {
  spies.post.mockResolvedValueOnce({ merged: true, row });
  spies.patch.mockResolvedValueOnce(row);

  expect(
    await addShoppingListRow({ itemId: "i", listId: "l", quantity: 2 }),
  ).toMatchObject({ merged: true });
  await updateShoppingListRow({ id: "r", quantity: 3 });
  await deleteShoppingListRow("r");

  expect(spies.post).toHaveBeenCalledWith("/v1/stock/shopping-lists/l/rows", {
    itemId: "i",
    quantity: 2,
  });
  expect(spies.patch).toHaveBeenCalledWith("/v1/stock/shopping-lists/rows/r", {
    quantity: 3,
  });
  expect(spies.delete).toHaveBeenCalledWith("/v1/stock/shopping-lists/rows/r");
});

it("SHOULD wrap an unknown failure in a GenericError with ids only", async () => {
  spies.get.mockRejectedValue(new Error("boom"));
  spies.post.mockRejectedValue(new Error("boom"));
  spies.patch.mockRejectedValue(new Error("boom"));
  spies.delete.mockRejectedValue(new Error("boom"));

  await expect(getShoppingLists({ ownerId: "o" })).rejects.toBeInstanceOf(
    GenericError,
  );
  await expect(getShoppingList("l")).rejects.toBeInstanceOf(GenericError);
  await expect(getRestockSummary()).rejects.toBeInstanceOf(GenericError);
  await expect(
    createShoppingList({ name: "x", owner: "USER", ownerId: "o" }),
  ).rejects.toBeInstanceOf(GenericError);
  await expect(
    addShoppingListRow({ listId: "l", quantity: 1 }),
  ).rejects.toBeInstanceOf(GenericError);
  await expect(updateShoppingList({ id: "l" })).rejects.toBeInstanceOf(
    GenericError,
  );
  await expect(updateShoppingListRow({ id: "r" })).rejects.toBeInstanceOf(
    GenericError,
  );
  await expect(deleteShoppingListRow("r")).rejects.toBeInstanceOf(GenericError);
});
