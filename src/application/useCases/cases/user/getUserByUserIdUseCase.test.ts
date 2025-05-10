import UserDTO from "@application/dto/user/UserDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getUserByUserIdUseCase.mocks";

it("SHOULD call the repository to get user by id", async () => {
  spies.userRepository.getUserById.mockResolvedValueOnce(mocks.userEntity);

  await setup();

  expect(spies.userRepository.getUserById).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.getUserById).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD return empty if the user is not found", async () => {
  spies.userRepository.getUserById.mockResolvedValueOnce(undefined);

  const result = await setup();

  expect(result).toBeUndefined();
});

it("SHOULD return a UserDTO if the user is found", async () => {
  const result = await setup();

  expect(result).toEqual(UserDTO.fromEntity(mocks.userEntity));
});

it("SHOULD throw an error if the repository throws an error", async () => {
  spies.userRepository.getUserById.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.unknown);
});

it("SHOULD throw BusinessError if the repository throws a BusinessError", async () => {
  spies.userRepository.getUserById.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.business);
  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("context", {
    any_context: "any context",
    useCase: "getUserByUserIdUseCase",
  });
});
