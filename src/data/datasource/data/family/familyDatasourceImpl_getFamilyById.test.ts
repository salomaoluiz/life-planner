import {
  BusinessError,
  FamilyNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_getFamilyById.mocks";

it("SHOULD call supabase to get the family provided by id", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.supabase.success.family);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("family");

  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();

  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("id", mocks.defaultParams);
});

it("SHOULD throw an error WHEN the user has no families", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.supabase.success.empty);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(FamilyNotFound);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - getFamilyById",
    familyId: mocks.defaultParams,
  });
});

it("SHOULD throw an error WHEN supabase fails", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.supabase.errors.unknown);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    error: mocks.supabase.errors.unknown,
    familyId: mocks.defaultParams,
  });
});

it("SHOULD throw an error WHEN supabase fails with a business error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.supabase.errors.business);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(BusinessError);
  expect(error).toHaveProperty("context", {
    any_context: "any_context",
  });
});
