import { FamilyNotFound, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/familyDatasourceImpl_getFamilies.mocks";

it("SHOULD call supabase for family-members and family correctly WHEN the user has families", async () => {
  spies.supabase.then
    .mockResolvedValueOnce(mocks.familyMembersSuccessResponse)
    .mockResolvedValueOnce(mocks.familiesSuccessResponse);

  await setup("123");

  expect(spies.supabase.from).toHaveBeenCalledTimes(2);
  expect(spies.supabase.from).toHaveBeenNthCalledWith(1, "family-member");
  expect(spies.supabase.from).toHaveBeenNthCalledWith(2, "family");

  expect(spies.supabase.select).toHaveBeenCalledTimes(2);
  expect(spies.supabase.select).toHaveBeenNthCalledWith(
    1,
    "user_id, family_id",
  );
  expect(spies.supabase.select).toHaveBeenNthCalledWith(2);

  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("user_id", "123");

  expect(spies.supabase.in).toHaveBeenCalledTimes(1);
  expect(spies.supabase.in).toHaveBeenCalledWith("id", ["123"]);
});

it.each([[], null])(
  "SHOULD call supabase only for family-members WHEN has no data in %p",
  async (data) => {
    spies.supabase.then.mockResolvedValueOnce({ data });

    await setup("123");

    expect(spies.supabase.from).toHaveBeenCalledTimes(1);
    expect(spies.supabase.from).toHaveBeenCalledWith("family-member");

    expect(spies.supabase.select).toHaveBeenCalledTimes(1);
    expect(spies.supabase.select).toHaveBeenCalledWith("user_id, family_id");

    expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
    expect(spies.supabase.eq).toHaveBeenCalledWith("user_id", "123");

    expect(spies.supabase.in).not.toHaveBeenCalled();
    expect(spies.supabase.from).not.toHaveBeenCalledWith("family");
  },
);

it("SHOULD return a list of families WHEN the user has families", async () => {
  spies.supabase.then
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
  spies.supabase.then
    .mockResolvedValueOnce(mocks.familyMembersSuccessResponse)
    .mockResolvedValueOnce(mocks.responseEmptyData);

  const error = await throwableSetup("123");

  expect(error).toBeInstanceOf(FamilyNotFound);
  expect((error as FamilyNotFound).context).toEqual({ ids: ["123"] });
});

it("SHOULD throw an error WHEN supabase fails", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.responseError.error);

  const error = await throwableSetup("123");

  const expectedError = new GenericError();
  expectedError.addContext({
    error: mocks.responseError.error,
    userId: "123",
  });

  expect(error).toBeInstanceOf(GenericError);
  expect((error as GenericError).context).toEqual(expectedError.context);
});
