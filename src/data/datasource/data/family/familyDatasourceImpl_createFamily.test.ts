import FamilyModel from "@data/models/family/FamilyModel";
import { FamilyNotCreated, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_createFamily.mocks";

it("SHOULD call supabase WITH correct params", async () => {
  await setup({
    name: "name",
    ownerId: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  });

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family");
  expect(spies.supabaseUpsert).toHaveBeenCalledTimes(1);
  expect(spies.supabaseUpsert).toHaveBeenCalledWith({
    family_name: "name",
    owner_id: "f7c7c6dc-fbf1-4f72-a490-08150a4cd3e8",
  });
  expect(spies.supabaseSelect).toHaveBeenCalledTimes(1);
  expect(spies.supabaseSelect).toHaveBeenCalledWith();
  expect(spies.supabaseThen).toHaveBeenCalledTimes(1);
  expect(spies.supabaseThen).toHaveBeenCalledWith();
});

it("SHOULD return correct value in case of success", async () => {
  spies.supabaseThen.mockResolvedValueOnce(mocks.responseSuccess);

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
  spies.supabaseThen.mockResolvedValueOnce(mocks.responseError);

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
  spies.supabaseThen.mockResolvedValueOnce(mocks.responseEmptyData);

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
