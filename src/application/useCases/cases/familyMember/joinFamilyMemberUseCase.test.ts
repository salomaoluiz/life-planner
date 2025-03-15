import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/joinFamilyMemberUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.userSuccess as never);
  spies.joinFamilyMember.mockResolvedValueOnce(null as never);

  await setup();

  expect(spies.joinFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.joinFamilyMember).toHaveBeenCalledWith({
    inviteToken: "encoded-token",
    joinDate: new Date().toISOString(),
    userId: mocks.userSuccess.id,
  });
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.getUser.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.getUser.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "joinFamilyMemberUserCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
