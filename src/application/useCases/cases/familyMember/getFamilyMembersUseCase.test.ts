import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/getFamilyMembersUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.getFamilyMembers.mockResolvedValueOnce([]);

  await setup();

  expect(spies.getFamilyMembers).toHaveBeenCalledTimes(1);
  expect(spies.getFamilyMembers).toHaveBeenCalledWith("123");
});

it("SHOULD return the family members", async () => {
  spies.getFamilyMembers.mockResolvedValueOnce(mocks.familyMembersSuccess);

  const result = await setup();

  expect(result).toEqual(mocks.familyMembersSuccess);
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.getFamilyMembers.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.getFamilyMembers.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "getFamilyMembersUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
