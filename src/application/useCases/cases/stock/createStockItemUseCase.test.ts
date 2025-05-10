import { CreateStockItemUseCaseParams } from "@application/useCases/cases/stock/createStockItemUseCase";
import { BusinessError, FieldRequired } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createStockItemUseCase.mocks";

const createStockItemSpy = spies.stockRepository.createStockItem;

test.each(["description", "owner", "ownerId", "quantity", "unit"])(
  "SHOULD throw if the field %p is not provided",
  async (field) => {
    const fields = {
      ...mocks.defaultParams,
      [field]: undefined,
    } as CreateStockItemUseCaseParams;

    const result = await setupThrowable(fields);

    expect(result).toBeInstanceOf(FieldRequired);
    expect(result).toHaveProperty("message", `Fields ${field} are required`);
  },
);

it("SHOULD create a transaction", () => {
  setup();

  expect(createStockItemSpy).toHaveBeenCalledTimes(1);
  expect(createStockItemSpy).toHaveBeenCalledWith({
    barcode: mocks.defaultParams.barcode,
    brand: mocks.defaultParams.brand,
    description: mocks.defaultParams.description,
    expirationDate: mocks.defaultParams.expirationDate,
    notes: mocks.defaultParams.notes,
    openingDate: mocks.defaultParams.openingDate,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    purchaseDate: mocks.defaultParams.purchaseDate,
    quantity: mocks.defaultParams.quantity,
    unit: mocks.defaultParams.unit,
  });
});

it("SHOULD throw if the repository throws", async () => {
  createStockItemSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  createStockItemSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "createStockItemUseCase",
  });
});
