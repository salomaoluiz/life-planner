import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_createFamilyMember.mocks";

it("SHOULD call supabase.from with 'family-member' WHEN called", async () => {
  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("family_members");
  expect(spies.supabase.insert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.insert).toHaveBeenCalledWith({
    email: mocks.defaultProps.email,
    family_id: mocks.defaultProps.familyId,
    invite_token: mocks.defaultProps.inviteToken,
    join_date: mocks.defaultProps.joinDate,
    user_id: mocks.defaultProps.userId,
  });
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw an error WHEN supabase.from throws an error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.responseError.error);

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
