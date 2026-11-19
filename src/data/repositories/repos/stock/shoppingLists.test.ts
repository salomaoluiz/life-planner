import { mocks, spies } from "./mocks/stock.mocks";
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

it("SHOULD forward every call to the API datasource", async () => {
  const { datasources } = mocks;

  await getShoppingLists({ ownerId: "o" }, datasources);
  await getShoppingList("l", datasources);
  await getRestockSummary(datasources);
  await createShoppingList(
    { name: "x", owner: "USER", ownerId: "o" },
    datasources,
  );
  await updateShoppingList({ id: "l", name: "y" }, datasources);
  await addShoppingListRow({ listId: "l", quantity: 1 }, datasources);
  await updateShoppingListRow({ id: "r", quantity: 2 }, datasources);
  await deleteShoppingListRow("r", datasources);

  expect(spies.datasource.getShoppingLists).toHaveBeenCalledWith({
    ownerId: "o",
  });
  expect(spies.datasource.getShoppingList).toHaveBeenCalledWith("l");
  expect(spies.datasource.getRestockSummary).toHaveBeenCalledWith();
  expect(spies.datasource.createShoppingList).toHaveBeenCalledTimes(1);
  expect(spies.datasource.updateShoppingList).toHaveBeenCalledWith({
    id: "l",
    name: "y",
  });
  expect(spies.datasource.addShoppingListRow).toHaveBeenCalledTimes(1);
  expect(spies.datasource.updateShoppingListRow).toHaveBeenCalledWith({
    id: "r",
    quantity: 2,
  });
  expect(spies.datasource.deleteShoppingListRow).toHaveBeenCalledWith("r");
});
