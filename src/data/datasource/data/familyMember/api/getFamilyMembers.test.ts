import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import {
  ApiBusinessError,
  ConnectivityError,
  FamilyNotFound,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { setup, setupThrowable, spies } from "./mocks/getFamilyMembers.mocks";

const apiMembers = [
  {
    email: "test@example.com",
    familyId: "family-1",
    id: "m1",
    inviteExpired: false,
    joinedAt: "2026-10-01T12:00:00.000Z",
    role: "OWNER",
    status: "JOINED",
    user: { name: "Test Owner", photoUrl: null },
    userId: "u1",
  },
  {
    email: "pending@example.com",
    familyId: "family-1",
    id: "m2",
    inviteExpired: true,
    joinedAt: null,
    role: "MEMBER",
    status: "PENDING",
    user: null,
    userId: null,
  },
];

it("SHOULD GET the members of the family AND return models (null → undefined)", async () => {
  spies.get.mockResolvedValueOnce(apiMembers);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith("/v1/families/family-1/members");
  expect(result).toEqual(apiMembers.map((m) => FamilyMemberModel.fromJSON(m)));
  expect(result[1].user).toBeUndefined();
  expect(result[1].userId).toBeUndefined();
});

it("SHOULD return [] WHEN the API returns []", async () => {
  spies.get.mockResolvedValueOnce([]);

  expect(await setup()).toEqual([]);
});

it("SHOULD map 404 to FamilyNotFound", async () => {
  spies.get.mockRejectedValueOnce(new ApiBusinessError("nope", 404));

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotFound);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the family id", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyMemberDatasource - getFamilyMembers",
    error: expect.any(Error),
    familyId: "family-1",
  });
});
