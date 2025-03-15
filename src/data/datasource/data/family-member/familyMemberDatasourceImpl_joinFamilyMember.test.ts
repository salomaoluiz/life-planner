import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_joinFamilyMember.mocks";

it("SHOULD call supabase.from with 'family-member' WHEN called", async () => {
  await setup();

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family-member");
  expect(spies.supabaseUpdate).toHaveBeenCalledTimes(1);
  expect(spies.supabaseUpdate).toHaveBeenCalledWith({
    join_date: mocks.defaultProps.joinDate,
    user_id: mocks.defaultProps.userId,
  });
  expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
  expect(spies.supabaseEq).toHaveBeenCalledWith(
    "invite_token",
    mocks.defaultProps.inviteToken,
  );
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

  expect(error).toEqual(expectedError);
  expect(error).toBeInstanceOf(GenericError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
