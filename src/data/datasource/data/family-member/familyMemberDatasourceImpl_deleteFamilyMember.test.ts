import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyMemberDatasourceImpl_deleteFamilyMember.mocks";

it("SHOULD delete family member", async () => {
  spies.supabaseThen.mockResolvedValue(null);

  await setup("123");

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
  expect(spies.supabaseFrom).toHaveBeenCalledWith("family-member");
  expect(spies.supabaseDelete).toHaveBeenCalledTimes(1);
  expect(spies.supabaseDelete).toHaveBeenCalledWith();
  expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
  expect(spies.supabaseEq).toHaveBeenCalledWith("id", "123");
  expect(spies.supabaseThen).toHaveBeenCalledTimes(1);
  expect(spies.supabaseThen).toHaveBeenCalledWith();
});

it("SHOULD throw an error", async () => {
  spies.supabaseThen.mockRejectedValue(mocks.responseError.error);

  const error = await throwableSetup("123");

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    id: "123",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
