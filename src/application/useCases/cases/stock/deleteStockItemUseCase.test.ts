import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteStockItemUseCase.mocks";

const deleteStockItemSpy = spies.stockRepository.deleteStockItem;

it("SHOULD create a transaction", () => {
  setup();

  expect(deleteStockItemSpy).toHaveBeenCalledTimes(1);
  expect(deleteStockItemSpy).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    ownerId: mocks.defaultParams.ownerId,
  });
});

it("SHOULD throw if the repository throws", async () => {
  deleteStockItemSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  deleteStockItemSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "deleteStockItemUseCase",
  });
});
