import { FamilyNotFound, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_getFamilies.mocks";

it("SHOULD call supabase for family-members and family correctly WHEN the user has families", async () => {
  spies.supabaseThen
    .mockResolvedValueOnce(mocks.familyMembersSuccessResponse)
    .mockResolvedValueOnce(mocks.familiesSuccessResponse);

  await setup("123");

  expect(spies.supabaseFrom).toHaveBeenCalledTimes(2);
  expect(spies.supabaseFrom).toHaveBeenNthCalledWith(1, "family-member");
  expect(spies.supabaseFrom).toHaveBeenNthCalledWith(2, "family");

  expect(spies.supabaseSelect).toHaveBeenCalledTimes(2);
  expect(spies.supabaseSelect).toHaveBeenNthCalledWith(1, "user_id, family_id");
  expect(spies.supabaseSelect).toHaveBeenNthCalledWith(2);

  expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
  expect(spies.supabaseEq).toHaveBeenCalledWith("user_id", "123");

  expect(spies.supabaseIn).toHaveBeenCalledTimes(1);
  expect(spies.supabaseIn).toHaveBeenCalledWith("id", ["123"]);
});

it.each([[], null])(
  "SHOULD call supabase only for family-members WHEN has no data in %p",
  async (data) => {
    spies.supabaseThen.mockResolvedValueOnce({ data });

    await setup("123");

    expect(spies.supabaseFrom).toHaveBeenCalledTimes(1);
    expect(spies.supabaseFrom).toHaveBeenCalledWith("family-member");

    expect(spies.supabaseSelect).toHaveBeenCalledTimes(1);
    expect(spies.supabaseSelect).toHaveBeenCalledWith("user_id, family_id");

    expect(spies.supabaseEq).toHaveBeenCalledTimes(1);
    expect(spies.supabaseEq).toHaveBeenCalledWith("user_id", "123");

    expect(spies.supabaseIn).not.toHaveBeenCalled();
    expect(spies.supabaseFrom).not.toHaveBeenCalledWith("family");
  },
);

it("SHOULD return a list of families WHEN the user has families", async () => {
  spies.supabaseThen
    .mockResolvedValueOnce(mocks.familyMembersSuccessResponse)
    .mockResolvedValueOnce(mocks.familiesSuccessResponse);

  const response = await setup("123");

  expect(response).toEqual([
    {
      id: "123",
      name: "Family Name",
      ownerId: "321",
    },
    {
      id: "123",
      name: "Family Name",
      ownerId: "123",
    },
  ]);
});

it("SHOULD throw an error WHEN the user has no families", async () => {
  spies.supabaseThen
    .mockResolvedValueOnce(mocks.familyMembersSuccessResponse)
    .mockResolvedValueOnce(mocks.responseEmptyData);

  const error = await throwableSetup("123");

  expect(error).toBeInstanceOf(FamilyNotFound);
  expect((error as FamilyNotFound).context).toEqual({ ids: ["123"] });
});

it("SHOULD throw an error WHEN supabase fails", async () => {
  spies.supabaseThen.mockRejectedValueOnce(mocks.responseError.error);

  const error = await throwableSetup("123");

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    userId: "123",
  });

  expect(error).toBeInstanceOf(GenericError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
