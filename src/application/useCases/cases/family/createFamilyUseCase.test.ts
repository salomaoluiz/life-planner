import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/createFamilyUseCase.mocks";

it("SHOULD create a family for the current user AND NOT create the owner member (the API does)", async () => {
  spies.userRepository.getUser.mockResolvedValueOnce(mocks.userEntity);
  spies.familyRepository.createFamily.mockResolvedValueOnce(mocks.familyEntity);

  await setup();

  expect(spies.userRepository.getUser).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.createFamily).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.createFamily).toHaveBeenCalledWith({
    name: mocks.defaultParams.name,
    ownerId: mocks.userEntity.id,
  });
  expect(
    spies.familyMemberRepository.inviteFamilyMember,
  ).not.toHaveBeenCalled();
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.userRepository.getUser.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "createFamilyUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
