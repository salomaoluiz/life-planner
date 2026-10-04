import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/loginWithEmailUseCase.mocks";

it("SHOULD log in with the given credentials", async () => {
  await setup();

  expect(spies.loginRepository.loginWithEmail).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD normalize the email but not the password", async () => {
  await setup({ email: " Test@Example.com ", password: " Pass 123 " });

  expect(spies.loginRepository.loginWithEmail).toHaveBeenCalledWith({
    email: "test@example.com",
    password: " Pass 123 ",
  });
});

it("SHOULD add the use case context to a DefaultError and rethrow it", async () => {
  const error = new BusinessError();
  spies.loginRepository.loginWithEmail.mockRejectedValueOnce(error);

  const result = await setupThrowable();

  expect(result).toBe(error);
  expect(error.context).toEqual({ useCase: "loginWithEmailUseCase" });
});

it("SHOULD rethrow a non-DefaultError", async () => {
  const error = new Error("boom");
  spies.loginRepository.loginWithEmail.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});
