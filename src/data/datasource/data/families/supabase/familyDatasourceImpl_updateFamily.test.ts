import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_updateFamily.mocks";

it("SHOULD call supabase WITH correct params", async () => {
  await setup({
    id: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
    name: "New Name",
  });

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("families");
  expect(spies.supabase.update).toHaveBeenCalledTimes(1);
  expect(spies.supabase.update).toHaveBeenCalledWith({
    family_name: "New Name",
  });
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith(
    "id",
    "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  );
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw error in case of error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.responseError.error);

  const params = {
    id: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
    name: "name",
  };

  const error = await throwableSetup(params);

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    params,
  });

  expect(error).toEqual(expectedError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
