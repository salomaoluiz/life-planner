import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_deleteFamily.mocks";

it("SHOULD call supabase WITH correct params", async () => {
  spies.supabase.then.mockResolvedValueOnce(null);

  await setup("56acd563-dfc9-4804-b066-ef35bd123826");

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("families");
  expect(spies.supabase.delete).toHaveBeenCalledTimes(1);
  expect(spies.supabase.delete).toHaveBeenCalledWith();
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith(
    "id",
    "56acd563-dfc9-4804-b066-ef35bd123826",
  );
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return nothing in case of success", async () => {
  spies.supabase.then.mockResolvedValueOnce(null);

  const result = await setup("56acd563-dfc9-4804-b066-ef35bd123826");

  expect(result).toEqual(undefined);
});

it("SHOULD throw error in case of error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.responseError.error);

  const id = "56acd563-dfc9-4804-b066-ef35bd123826";

  const error = await throwableSetup(id);

  const expectedError = new GenericError();
  expectedError.addContext({
    error: new Error("Something wrong"),
    id,
  });

  expect(error).toEqual(expectedError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
