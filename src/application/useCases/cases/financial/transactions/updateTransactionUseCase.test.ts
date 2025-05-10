import { BusinessError, FieldInvalid } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateTransactionUseCase.mocks";

const updateTransactionSpy =
  spies.financialRepositoryTransaction.updateTransaction;

it("SHOULD update all fields of transaction", () => {
  setup();

  expect(updateTransactionSpy).toHaveBeenCalledTimes(1);
  expect(updateTransactionSpy).toHaveBeenCalledWith({
    category: mocks.defaultParams.category,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    id: mocks.defaultParams.id,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });
});

it("SHOULD throw if the OWNER is invalid", async () => {
  const result = await setupThrowable({ owner: "INVALID_OWNER" });

  expect(result).toBeInstanceOf(FieldInvalid);
  expect(result).toHaveProperty("message", "The field owner are invalid");
});

it("SHOULD throw if the TYPE is invalid", async () => {
  const result = await setupThrowable({ type: "INVALID_TYPE" });

  expect(result).toBeInstanceOf(FieldInvalid);
  expect(result).toHaveProperty("message", "The field type are invalid");
});

it("SHOULD throw if the repository throws", async () => {
  updateTransactionSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  updateTransactionSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.updateTransactionUseCase",
  });
});
