import TransactionModel from "@data/models/financial/TransactionModel";
import { BusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createTransaction.mocks";

it("SHOULD call the supabase to create a new transaction", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("financial-transactions");
  expect(spies.supabase.upsert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.upsert).toHaveBeenCalledWith({
    category: mocks.defaultParams.category,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    owner: mocks.defaultParams.owner,
    owner_id: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return a transaction model WHEN the response is success", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  const result = await setup();

  expect(result).toBeInstanceOf(TransactionModel);
  expect(result).toEqual(
    TransactionModel.fromJSON(mocks.success.response.data[0]),
  );
});

it("SHOULD throw an business error if the supabase return on", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.errors.business);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(BusinessError);
  expect(error).toHaveProperty("context", {
    any_context: "any context",
  });
});

it("SHOULD throw a generic error if the supabase return an unknown error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - createTransaction",
    error: mocks.errors.unknown.error,
    params: mocks.defaultParams,
  });
});

it("SHOULD throw a generic error if the supabase return without data", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.withoutData);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - createTransaction",
    error: new Error("Without data response"),
    params: mocks.defaultParams,
  });
});
