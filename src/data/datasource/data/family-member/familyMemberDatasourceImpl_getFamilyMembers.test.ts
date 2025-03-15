import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_getFamilyMembers.mocks";

it("SHOULD call supabase with correct params", async () => {
  spies.supabaseThen.mockResolvedValue(mocks.successResponse);

  await setup("123");

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family-member");
  expect(spies.supabaseSelect).toHaveBeenCalledTimes(1);
  expect(spies.supabaseSelect).toHaveBeenCalledWith();
  expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
  expect(spies.supabaseEq).toHaveBeenCalledWith("family_id", "123");
  expect(spies.supabaseThen).toHaveBeenCalledTimes(1);
  expect(spies.supabaseThen).toHaveBeenCalledWith();
});

it("SHOULD return an empty array", async () => {
  spies.supabaseThen.mockResolvedValue(mocks.emptyResponse);

  const response = await setup("123");

  expect(response).toEqual([]);
});

it("SHOULD return a list of family members", async () => {
  spies.supabaseThen.mockResolvedValue(mocks.successResponse);

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
  spies.supabaseThen.mockRejectedValue(mocks.responseError.error);

  const error = await throwableSetup("123");

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    familyId: "123",
  });
  expect((error as GenericError).context).toEqual(expectedError.context);
  expect(error).toBeInstanceOf(GenericError);
});
