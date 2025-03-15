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

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family");
  expect(spies.supabaseUpdate).toHaveBeenCalledTimes(1);
  expect(spies.supabaseUpdate).toHaveBeenCalledWith({
    family_name: "New Name",
  });
  expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
  expect(spies.supabaseEq).toHaveBeenCalledWith(
    "id",
    "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  );
  expect(spies.supabaseThen).toHaveBeenCalledTimes(1);
  expect(spies.supabaseThen).toHaveBeenCalledWith();
});

it("SHOULD throw error in case of error", async () => {
  spies.supabaseThen.mockRejectedValueOnce(mocks.responseError.error);

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
