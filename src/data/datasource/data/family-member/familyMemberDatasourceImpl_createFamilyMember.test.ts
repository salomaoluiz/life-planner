import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_createFamilyMember.mocks";

it("SHOULD call supabase.from with 'family-member' WHEN called", async () => {
  await setup();

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family-member");
  expect(spies.supabaseInsert).toHaveBeenCalledTimes(1);
  expect(spies.supabaseInsert).toHaveBeenCalledWith({
    email: mocks.defaultProps.email,
    family_id: mocks.defaultProps.familyId,
    invite_token: mocks.defaultProps.inviteToken,
    join_date: mocks.defaultProps.joinDate,
    user_id: mocks.defaultProps.userId,
  });
  expect(spies.supabaseThen).toHaveBeenCalledTimes(1);
  expect(spies.supabaseThen).toHaveBeenCalledWith();
});

it("SHOULD throw an error WHEN supabase.from throws an error", async () => {
  spies.supabaseThen.mockRejectedValueOnce(mocks.responseError.error);

  const error = await throwableSetup(mocks.defaultProps);

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    params: mocks.defaultProps,
  });

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toEqual(expectedError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
