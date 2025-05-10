import { BusinessError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/loginWithGoogleUseCase.mocks";

it("SHOULD create a user if all repository return correctly", async () => {
  spies.loginRepository.loginWithGoogle.mockResolvedValueOnce(
    mocks.loginWithGoogleEntity,
  );
  spies.userRepository.getUserById.mockResolvedValueOnce(undefined);

  await setup().execute();

  expect(spies.loginRepository.loginWithGoogle).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.getUserById).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.getUserById).toHaveBeenCalledWith(
    mocks.loginWithGoogleEntity.id,
  );
  expect(spies.userRepository.createUser).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.createUser).toHaveBeenCalledWith({
    avatarURL: mocks.loginWithGoogleEntity.avatarURL,
    email: mocks.loginWithGoogleEntity.email,
    id: mocks.loginWithGoogleEntity.id,
    name: mocks.loginWithGoogleEntity.name,
  });
});

it("SHOULD not create a user if the loginWithGoogle return nothing", async () => {
  spies.loginRepository.loginWithGoogle.mockResolvedValueOnce(undefined);

  await setup().execute();

  expect(spies.loginRepository.loginWithGoogle).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.createUser).not.toHaveBeenCalled();
});

it("SHOULD not create a user if the getUserById found an user already created", async () => {
  spies.loginRepository.loginWithGoogle.mockResolvedValueOnce(
    mocks.loginWithGoogleEntity,
  );
  spies.userRepository.getUserById.mockResolvedValueOnce(mocks.userEntity);

  await setup().execute();

  expect(spies.loginRepository.loginWithGoogle).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.createUser).not.toHaveBeenCalled();
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error logging in with Google");
  spies.loginRepository.loginWithGoogle.mockRejectedValueOnce(error);

  async function func() {
    return setup().execute();
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  spies.loginRepository.loginWithGoogle.mockRejectedValueOnce(businessError);

  async function result() {
    return setup().execute();
  }

  await expect(result).rejects.toThrow(businessError);
});
