import { GenericError } from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/createUser.mocks";

it("SHOULD call the supabase to create a new user", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("users");
  expect(spies.supabase.insert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.insert).toHaveBeenCalledWith({
    avatar_url: mocks.defaultParams.avatarURL,
    email: mocks.defaultParams.email,
    id: mocks.defaultParams.id,
    name: mocks.defaultParams.name,
  });
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw a generic error if the supabase return an unknown error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "UserDatasource - createUser",
    error: mocks.errors.unknown.error,
    params: mocks.defaultParams,
  });
});
