import FamilyModel from "@data/models/family/FamilyModel";
import { FamilyNotCreated, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_createFamily.mocks";

it("SHOULD call supabase WITH correct params", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseSuccess);

  await setup({
    name: "name",
    ownerId: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  });

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("family");
  expect(spies.supabase.upsert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.upsert).toHaveBeenCalledWith({
    family_name: "name",
    owner_id: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  });
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return correct value in case of success", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseSuccess);

  const result = await setup({
    name: "name",
    ownerId: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  });

  expect(result).toEqual(
    new FamilyModel({
      id: mocks.responseSuccess.data[0].id,
      name: mocks.responseSuccess.data[0].name,
      ownerId: mocks.responseSuccess.data[0].owner_id,
    }),
  );
});

it("SHOULD throw error in case of error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseError);

  const params = {
    name: "name",
    ownerId: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
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

it("SHOULD throw error in case of no data", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseEmptyData);

  const params = {
    name: "name",
    ownerId: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  };

  const error = await throwableSetup(params);

  const expectedError = new FamilyNotCreated();
  expectedError.addContext({
    params,
  });

  expect((error as GenericError).context).toEqual(expectedError.context);
  expect(error).toEqual(expectedError);
});
