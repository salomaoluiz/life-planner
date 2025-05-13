import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";

import { mocks, setup, spies } from "./mocks/stockRepositoryImpl.mocks";

it("SHOULD call createStockItem correctly", async () => {
  const { createStockItem } = setup();

  const params = {
    barcode: "1234567890123",
    brand: "Some Brand",
    description: "Some Description",
    expirationDate: new Date(),
    notes: "Some Notes",
    openingDate: new Date(),
    owner: StockOwners.FAMILY,
    ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
    purchaseDate: new Date(),
    quantity: 10,
    unit: StockUnits.GRAM,
  };

  const stock = await createStockItem(params);

  expect(spies.createStockItem).toHaveBeenCalledTimes(1);
  expect(spies.createStockItem).toHaveBeenCalledWith(params, mocks.datasources);
  expect(stock).toEqual("createStockItem response");
});

it("SHOULD call deleteStockItem correctly", async () => {
  const { deleteStockItem } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    ownerId: "6eff80a7-e5e2-499d-9e47-5a448a753a03",
  };

  await deleteStockItem(params);

  expect(spies.deleteStockItem).toHaveBeenCalledTimes(1);
  expect(spies.deleteStockItem).toHaveBeenCalledWith(params, mocks.datasources);
});

it("SHOULD call getStockItems correctly", async () => {
  const { getStockItems } = setup();

  const ownerId = "bb3443d4-a9bd-401e-9732-d6bf0dca7e83";

  const families = await getStockItems(ownerId);

  expect(spies.getStockItems).toHaveBeenCalledTimes(1);
  expect(spies.getStockItems).toHaveBeenCalledWith(ownerId, mocks.datasources);
  expect(families).toEqual("getStockItems response");
});

it("SHOULD call updateStockItem correctly", async () => {
  const { updateStockItem } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    ownerId: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
  };

  await updateStockItem(params);

  expect(spies.updateStockItem).toHaveBeenCalledTimes(1);
  expect(spies.updateStockItem).toHaveBeenCalledWith(params, mocks.datasources);
});
