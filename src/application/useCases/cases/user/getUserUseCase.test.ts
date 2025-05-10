import UserDTO from "@application/dto/user/UserDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getUserUseCase.mocks";

it("SHOULD call the repository to get user", async () => {
  const result = await setup();

  expect(spies.userRepository.getUser).toHaveBeenCalledTimes(1);
  expect(result).toEqual(UserDTO.fromEntity(mocks.userEntity));
});

it("SHOULD throw an error if the repository throws an error", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.unknown);
});

it("SHOULD throw BusinessError if the repository throws a BusinessError", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.business);
  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("context", {
    any_context: "any context",
    useCase: "getUserUseCase",
  });
});
