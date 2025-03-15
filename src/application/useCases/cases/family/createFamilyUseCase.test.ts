import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/createFamilyUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.userSuccess as never);
  spies.createFamily.mockResolvedValueOnce(mocks.familySuccess as never);
  spies.encode.mockResolvedValueOnce("encodedToken");

  await setup();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(spies.getUser).toHaveBeenCalledWith();
  expect(spies.createFamily).toHaveBeenCalledTimes(1);
  expect(spies.createFamily).toHaveBeenCalledWith({
    name: "New Family",
    ownerId: mocks.userSuccess.id,
  });
  expect(spies.createFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.createFamilyMember).toHaveBeenCalledWith({
    email: mocks.userSuccess.email,
    familyId: mocks.familySuccess.id,
    inviteToken: "encodedToken",
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
    useCase: "createFamilyUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
