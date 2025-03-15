import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_deleteFamily.mocks";

it("SHOULD call supabase WITH correct params", async () => {
  await setup("56acd563-dfc9-4804-b066-ef35bd123826");

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family");
  expect(spies.supabaseDelete).toHaveBeenCalledTimes(1);
  expect(spies.supabaseDelete).toHaveBeenCalledWith();
  expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
  expect(spies.supabaseEq).toHaveBeenCalledWith(
    "id",
    "56acd563-dfc9-4804-b066-ef35bd123826",
  );
  expect(spies.supabaseThen).toHaveBeenCalledTimes(1);
  expect(spies.supabaseThen).toHaveBeenCalledWith();
});

it("SHOULD return nothing in case of success", async () => {
  spies.supabaseThen.mockResolvedValueOnce(null);

  const result = await setup("56acd563-dfc9-4804-b066-ef35bd123826");

  expect(result).toEqual(undefined);
});

it("SHOULD throw error in case of error", async () => {
  spies.supabaseThen.mockRejectedValueOnce(mocks.responseError.error);

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
