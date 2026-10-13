import {
  ApiBusinessError,
  ConnectivityError,
  FamilyMemberAlreadyExists,
  FamilyNotFound,
  FieldInvalid,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/inviteFamilyMember.mocks";

it("SHOULD POST exactly { email } AND return the token and expiry", async () => {
  spies.post.mockResolvedValueOnce({
    inviteExpiresAt: "2026-10-11T12:00:00.000Z",
    inviteToken: mocks.token,
    member: {},
  });

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/families/family-1/members", {
    email: mocks.email,
  });
  expect(result).toEqual({
    inviteExpiresAt: "2026-10-11T12:00:00.000Z",
    inviteToken: mocks.token,
  });
});

it.each([
  [400, FieldInvalid],
  [404, FamilyNotFound],
  [409, FamilyMemberAlreadyExists],
])("SHOULD map status %s to its business error", async (status, Expected) => {
  spies.post.mockRejectedValueOnce(new ApiBusinessError("x", status));

  expect(await setupThrowable()).toBeInstanceOf(Expected);
});

it("SHOULD map an unmapped 403 to GenericError WITHOUT the email or token in the context", async () => {
  spies.post.mockRejectedValueOnce(new ApiBusinessError("Forbidden", 403));

  const error = (await setupThrowable()) as GenericError;

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "FamilyMemberDatasource - inviteFamilyMember",
    familyId: "family-1",
  });
  const text = JSON.stringify({ ...error.context, error: undefined });
  expect(text).not.toContain(mocks.email);
  expect(text).not.toContain(mocks.token);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.post.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});
