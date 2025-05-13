import { BusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactions.mocks";

it("SHOULD call the supabase to get all transactions", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("financial-transactions");
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.in).toHaveBeenCalledTimes(1);
  expect(spies.supabase.in).toHaveBeenCalledWith(
    "owner_id",
    mocks.defaultParams,
  );
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw an error if the supabase throws", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - getTransactions",
    error: mocks.errors.unknown,
    ownerIds: mocks.defaultParams,
  });
});

it("SHOULD throw an business error if the supabase return on", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.errors.business);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(BusinessError);
  expect(error).toHaveProperty("context", {
    any_context: "any context",
  });
});

it("SHOULD throw a generic error if the supabase return without data", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.withoutData);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - getTransactions",
    error: new Error("Transaction without data"),
    ownerIds: mocks.defaultParams,
  });
});
