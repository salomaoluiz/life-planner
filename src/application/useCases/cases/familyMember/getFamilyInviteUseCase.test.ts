import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";
import {
  DefaultError,
  GenericError,
  InviteNotFound,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/getFamilyInviteUseCase.mocks";

it("SHOULD return the invite as a DTO AND call the repository with the token", async () => {
  spies.getInvite.mockResolvedValueOnce(mocks.inviteEntity);

  const result = await setup();

  expect(spies.getInvite).toHaveBeenCalledWith(mocks.validToken);
  expect(result).toBeInstanceOf(FamilyInviteDTO);
  expect(result).toEqual({ ...mocks.inviteEntity });
});

it.each([
  ["empty", ""],
  ["too short", "abc"],
  ["too long", "a".repeat(44)],
  ["legacy base64 JSON", btoa('{"familyId":"1","email":"a@b.c"}')],
  ["path trick", "../../user/me"],
  ["not a string", null],
])(
  "SHOULD throw InviteNotFound WITHOUT calling the API WHEN the token is %s",
  async (_label, token) => {
    const error = await throwableSetup(token);

    expect(error).toBeInstanceOf(InviteNotFound);
    expect(spies.getInvite).not.toHaveBeenCalled();
  },
);

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("Repository failed");
  spies.getInvite.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup(mocks.validToken);

  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD add the use case to the context of a DefaultError", async () => {
  spies.getInvite.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup(mocks.validToken);

  const expectedError = new GenericError();
  expectedError.addContext({ useCase: "getFamilyInviteUseCase" });
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
