import { BusinessError, FieldRequired } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateStockItemUseCase.mocks";

const updateStockItemSpy = spies.stockRepository.updateStockItem;

it("SHOULD create a transaction", () => {
  setup();

  expect(updateStockItemSpy).toHaveBeenCalledTimes(1);
  expect(updateStockItemSpy).toHaveBeenCalledWith({
    barcode: mocks.defaultParams.barcode,
    brand: mocks.defaultParams.brand,
    description: mocks.defaultParams.description,
    expirationDate: mocks.defaultParams.expirationDate,
    id: mocks.defaultParams.id,
    notes: mocks.defaultParams.notes,
    openingDate: mocks.defaultParams.openingDate,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    purchaseDate: mocks.defaultParams.purchaseDate,
    quantity: mocks.defaultParams.quantity,
    unit: mocks.defaultParams.unit,
  });
});

it("SHOULD throw if the id is not provided", async () => {
  const result = await setupThrowable({ id: undefined });

  expect(result).toBeInstanceOf(FieldRequired);
  expect(result).toHaveProperty("message", "Fields id are required");
});

it("SHOULD throw if the repository throws", async () => {
  updateStockItemSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  updateStockItemSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "updateStockItemUseCase",
  });
});
