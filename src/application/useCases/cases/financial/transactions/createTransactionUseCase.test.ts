import { BusinessError, FieldInvalid } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createTransactionUseCase.mocks";

const createTransactionSpy =
  spies.financialRepositoryTransaction.createTransaction;

it("SHOULD create a transaction", () => {
  setup();

  expect(createTransactionSpy).toHaveBeenCalledTimes(1);
  expect(createTransactionSpy).toHaveBeenCalledWith({
    category: mocks.defaultParams.category,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });
});

it("SHOULD throw if the repository throws", async () => {
  createTransactionSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  createTransactionSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.createTransactionUseCase",
  });
});

it("SHOULD throw if the OWNER is not a valid one", async () => {
  const result = await setupThrowable({ owner: "INVALID_OWNER" });

  expect(result).toBeInstanceOf(FieldInvalid);
  expect(result).toHaveProperty("message", "The field owner are invalid");
});

it("SHOULD throw if the TYPE is not a valid one", async () => {
  const result = await setupThrowable({ type: "INVALID_TYPE" });

  expect(result).toBeInstanceOf(FieldInvalid);
  expect(result).toHaveProperty("message", "The field type are invalid");
});
