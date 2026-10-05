import {
  ApiBusinessError,
  ConnectivityError,
  FamilyMemberAlreadyExists,
  GenericError,
  InviteEmailMismatch,
  InviteExpired,
  InviteNotFound,
  UserNotLoggedError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/joinFamilyMember.mocks";

it("SHOULD POST to accept WITH NO BODY", async () => {
  spies.post.mockResolvedValueOnce({});

  await setup();

  expect(spies.post).toHaveBeenCalledTimes(1);
  expect(spies.post.mock.calls[0]).toEqual([
    `/v1/family-invites/${mocks.token}/accept`,
  ]);
});

it.each([
  [400, InviteNotFound],
  [403, InviteEmailMismatch],
  [404, InviteNotFound],
  [409, FamilyMemberAlreadyExists],
  [410, InviteExpired],
])("SHOULD map status %s to its business error", async (status, Expected) => {
  spies.post.mockRejectedValueOnce(new ApiBusinessError("x", status));

  expect(await setupThrowable()).toBeInstanceOf(Expected);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.post.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError WITHOUT the token in the context", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = (await setupThrowable()) as GenericError;

  expect(error).toBeInstanceOf(GenericError);
  expect(JSON.stringify({ ...error.context, error: undefined })).not.toContain(
    mocks.token,
  );
});
