import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_joinFamilyMember.mocks";

it("SHOULD call supabase.from with 'family-member' WHEN called", async () => {
  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("family-member");
  expect(spies.supabase.update).toHaveBeenCalledTimes(1);
  expect(spies.supabase.update).toHaveBeenCalledWith({
    join_date: mocks.defaultProps.joinDate,
    user_id: mocks.defaultProps.userId,
  });
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith(
    "invite_token",
    mocks.defaultProps.inviteToken,
  );
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

  expect(error).toEqual(expectedError);
  expect(error).toBeInstanceOf(GenericError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
