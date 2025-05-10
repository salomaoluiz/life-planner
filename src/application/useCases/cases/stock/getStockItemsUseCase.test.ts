import StockDTO from "@application/dto/stock/StockDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getStockItemsUseCase.mocks";

const getStockItemsSpy = spies.stockRepository.getStockItems;

it("SHOULD get the stock item for each owner", () => {
  setup();

  expect(getStockItemsSpy).toHaveBeenCalledTimes(
    mocks.defaultParams.ownerIds.length,
  );
  mocks.defaultParams.ownerIds.forEach((ownerId, index) => {
    expect(getStockItemsSpy).toHaveBeenNthCalledWith(index + 1, ownerId);
  });
});

it("SHOULD return the stock items", async () => {
  const result = await setup();

  const expected = mocks.stockItems.map((item) => StockDTO.fromEntity(item));

  expect(result).toEqual(expected);
});

it("SHOULD throw if the repository throws", async () => {
  getStockItemsSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  getStockItemsSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "getStockItemsUseCase",
  });
});
