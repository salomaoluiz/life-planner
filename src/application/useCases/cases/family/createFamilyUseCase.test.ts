import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/createFamilyUseCase.mocks";

it("SHOULD create a family AND add the current user as a family member", async () => {
  spies.userRepository.getUser.mockResolvedValueOnce(mocks.userEntity);
  spies.familyRepository.createFamily.mockResolvedValueOnce(mocks.familyEntity);
  spies.encode.mockResolvedValueOnce(mocks.encodeResult);

  await setup();

  expect(spies.userRepository.getUser).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.createFamily).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.createFamily).toHaveBeenCalledWith({
    name: mocks.defaultParams.name,
    ownerId: mocks.userEntity.id,
  });
  expect(spies.encode).toHaveBeenCalledTimes(1);
  expect(spies.encode).toHaveBeenCalledWith({
    email: mocks.userEntity.email,
    familyId: mocks.familyEntity.id,
    joinDate: "2025-01-01T00:00:00.000Z",
  });
  expect(spies.familyMemberRepository.createFamilyMember).toHaveBeenCalledTimes(
    1,
  );
  expect(spies.familyMemberRepository.createFamilyMember).toHaveBeenCalledWith({
    email: mocks.userEntity.email,
    familyId: mocks.familyEntity.id,
    inviteToken: mocks.encodeResult,
    joinDate: "2025-01-01T00:00:00.000Z",
    userId: mocks.userEntity.id,
  });
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
