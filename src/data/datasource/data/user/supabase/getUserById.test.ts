import UserModel from "@data/models/user/UserModel";
import { GenericError } from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getUserById.mocks";

it("SHOULD call the supabase to get the user of the user_id provided", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("users");
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("id", mocks.defaultParams);
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return the stock items from the supabase", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  const response = await setup();

  expect(response).toEqual(
    UserModel.fromJSON({
      avatar_url: mocks.success.response.data[0].avatar_url,
      email: mocks.success.response.data[0].email,
      id: mocks.success.response.data[0].id,
      name: mocks.success.response.data[0].name,
    }),
  );
});

it("SHOULD return undefined if the supabase returns an empty array", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.empty);

  const response = await setup();

  expect(response).toBeUndefined();
});

it("SHOULD throw an error if the supabase returns an error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "UserDatasource - getUserById",
    error: mocks.errors.unknown.error,
    id: mocks.defaultParams,
  });
});
