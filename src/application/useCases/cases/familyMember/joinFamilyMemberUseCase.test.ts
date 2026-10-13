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
} from "./mocks/joinFamilyMemberUseCase.mocks";

it("SHOULD send ONLY the token (the API takes user and joinedAt from the JWT and server time)", async () => {
  spies.joinFamilyMember.mockResolvedValueOnce(undefined);

  await setup();

  expect(spies.joinFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.joinFamilyMember).toHaveBeenCalledWith({
    inviteToken: mocks.validToken,
  });
  expect(spies.getUser).not.toHaveBeenCalled();
});

it.each([
  ["empty", ""],
  ["too short", "abc"],
  ["too long", "a".repeat(44)],
  ["legacy base64 JSON", btoa('{"familyId":"1","email":"a@b.c"}')],
  ["path trick", "../../user/me"],
  ["not a string", null],
  ["array param", ["a", "b"]],
])(
  "SHOULD throw InviteNotFound WITHOUT calling the API WHEN the token is %s",
  async (_label, token) => {
    const error = await throwableSetup(token);

    expect(error).toBeInstanceOf(InviteNotFound);
    expect(spies.joinFamilyMember).not.toHaveBeenCalled();
  },
);

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("Repository failed");
  spies.joinFamilyMember.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup(mocks.validToken);

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD add the use case to the context of a DefaultError", async () => {
  spies.joinFamilyMember.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup(mocks.validToken);

  const expectedError = new GenericError();
  expectedError.addContext({ useCase: "joinFamilyMemberUserCase" });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
