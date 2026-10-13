import FamilyInviteModel from "@data/models/familyMember/FamilyInviteModel";
import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  InviteExpired,
  InviteNotFound,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getInvite.mocks";

const apiInvite = {
  email: "test@example.com",
  emailMatches: true,
  familyId: "family-1",
  familyName: "Test Family",
  inviteExpiresAt: "2026-10-11T12:00:00.000Z",
};

it("SHOULD GET the invite by token AND return a FamilyInviteModel", async () => {
  spies.get.mockResolvedValueOnce(apiInvite);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(`/v1/family-invites/${mocks.token}`);
  expect(result).toEqual(FamilyInviteModel.fromJSON(apiInvite));
});

it("SHOULD URL-encode the token in the path", async () => {
  spies.get.mockResolvedValueOnce(apiInvite);

  await setup("a/b");

  expect(spies.get).toHaveBeenCalledWith("/v1/family-invites/a%2Fb");
});

it.each([
  [400, InviteNotFound],
  [404, InviteNotFound],
  [410, InviteExpired],
])("SHOULD map status %s to its business error", async (status, Expected) => {
  spies.get.mockRejectedValueOnce(new ApiBusinessError("x", status));

  expect(await setupThrowable()).toBeInstanceOf(Expected);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError WITHOUT the token in the context", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = (await setupThrowable()) as GenericError;

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toEqual({
    datasource: "FamilyMemberDatasource - getInvite",
    error: expect.any(Error),
  });
  expect(JSON.stringify({ ...error.context, error: undefined })).not.toContain(
    mocks.token,
  );
});
