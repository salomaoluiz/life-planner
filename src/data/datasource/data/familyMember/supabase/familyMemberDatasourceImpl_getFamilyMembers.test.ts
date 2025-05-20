import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_getFamilyMembers.mocks";

it("SHOULD call supabase with correct params", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.successResponse);

  await setup("123");

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("family_members");
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("family_id", "123");
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return an empty array", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.emptyResponse);

  const response = await setup("123");

  expect(response).toEqual([]);
});

it("SHOULD return a list of family members", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.successResponse);

  const response = await setup("123");

  expect(response).toEqual([
    new FamilyMemberModel({
      email: "teste@gmail.com",
      familyId: "321",
      id: "123",
      inviteToken: "fake_jwt_token",
      joinDate: "2021-09-09",
      userId: "111",
    }),
  ]);
});

it("SHOULD throw an error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.responseError.error);

  const error = await throwableSetup("123");

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    familyId: "123",
  });
  expect((error as GenericError).context).toEqual(expectedError.context);
  expect(error).toBeInstanceOf(GenericError);
});
