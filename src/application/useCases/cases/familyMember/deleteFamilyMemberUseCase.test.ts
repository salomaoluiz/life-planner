import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  setup,
  spies,
  throwableSetup,
} from "./mocks/deleteFamilyMemberUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.deleteFamilyMember.mockResolvedValueOnce(null as never);

  await setup();

  expect(spies.deleteFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.deleteFamilyMember).toHaveBeenCalledWith("123");
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.deleteFamilyMember.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.deleteFamilyMember.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "deleteFamilyMemberUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
