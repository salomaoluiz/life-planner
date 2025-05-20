import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_deleteFamilyMember.mocks";

it("SHOULD delete family member", async () => {
  spies.supabase.then.mockResolvedValueOnce(null);

  await setup("123");

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("family_members");
  expect(spies.supabase.delete).toHaveBeenCalledTimes(1);
  expect(spies.supabase.delete).toHaveBeenCalledWith();
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("id", "123");
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw an error", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.responseError.error);

  const error = await throwableSetup("0a76bfd9-91f2-40b1-87c7-13114cf59496");

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    id: "0a76bfd9-91f2-40b1-87c7-13114cf59496",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
