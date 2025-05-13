import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateTransaction.mocks";

it("SHOULD call the supabase to create a new transaction", async () => {
  spies.supabase.then.mockResolvedValueOnce(null);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("financial-transactions");
  expect(spies.supabase.update).toHaveBeenCalledTimes(1);
  expect(spies.supabase.update).toHaveBeenCalledWith({
    category: mocks.defaultParams.category,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    owner: mocks.defaultParams.owner,
    owner_id: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("id", mocks.defaultParams.id);
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw a generic error if the supabase return an unknown error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - updateTransaction",
    error: mocks.errors.unknown,
    params: mocks.defaultParams,
  });
});
