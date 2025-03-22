import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  setup,
  spies,
  throwableSetup,
} from "./mocks/inviteFamilyMemberUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.createFamilyMember.mockResolvedValueOnce(null as never);

  await setup();

  expect(spies.encode).toHaveBeenCalledTimes(1);
  expect(spies.encode).toHaveBeenCalledWith({
    email: "test@gmail.com",
    familyId: "123",
    familyName: "Family name",
    inviteDate: Date.now(),
    ownerId: "owner-id",
  });
  expect(spies.createFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.createFamilyMember).toHaveBeenCalledWith({
    email: "test@gmail.com",
    familyId: "123",
    inviteToken: "encoded-token",
  });
});

it("SHOULD return the invite token", async () => {
  spies.createFamilyMember.mockResolvedValueOnce(null as never);

  const response = await setup();

  expect(response).toEqual({ inviteToken: "encoded-token" });
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.createFamilyMember.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.createFamilyMember.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "inviteFamilyMemberUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
