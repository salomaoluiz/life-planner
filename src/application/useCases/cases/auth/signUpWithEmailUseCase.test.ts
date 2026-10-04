import {
  AutoLoginFailedError,
  ConnectivityError,
  EmailAlreadyInUseError,
} from "@domain/entities/errors";

import {
  setup,
  setupThrowable,
  spies,
} from "./mocks/signUpWithEmailUseCase.mocks";

it("SHOULD sign up and then log in with the same normalized credentials", async () => {
  const order: string[] = [];
  spies.loginRepository.signUpWithEmail.mockImplementationOnce(async () => {
    order.push("signUp");
  });
  spies.loginRepository.loginWithEmail.mockImplementationOnce(async () => {
    order.push("login");
  });

  await setup({
    email: " Test@Example.com ",
    name: " Ana ",
    password: "password123",
  });

  expect(spies.loginRepository.signUpWithEmail).toHaveBeenCalledWith({
    email: "test@example.com",
    name: "Ana",
    password: "password123",
  });
  expect(spies.loginRepository.loginWithEmail).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "password123",
  });
  expect(order).toEqual(["signUp", "login"]);
});

it("SHOULD NOT log in WHEN sign up fails (email already in use)", async () => {
  spies.loginRepository.signUpWithEmail.mockRejectedValueOnce(
    new EmailAlreadyInUseError(),
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(EmailAlreadyInUseError);
  expect(error).toHaveProperty("context", {
    useCase: "signUpWithEmailUseCase",
  });
  expect(spies.loginRepository.loginWithEmail).not.toHaveBeenCalled();
});

it("SHOULD rethrow a non-DefaultError from sign up", async () => {
  const error = new Error("boom");
  spies.loginRepository.signUpWithEmail.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD throw AutoLoginFailedError WHEN the automatic login fails after a successful sign up", async () => {
  spies.loginRepository.loginWithEmail.mockRejectedValueOnce(
    new ConnectivityError(),
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(AutoLoginFailedError);
  expect(error).toHaveProperty("context", {
    cause: "ConnectivityError",
    useCase: "signUpWithEmailUseCase",
  });
});

it("SHOULD label the cause unknown WHEN the automatic login throws a non-Error", async () => {
  spies.loginRepository.loginWithEmail.mockRejectedValueOnce("weird");

  expect(await setupThrowable()).toHaveProperty("context", {
    cause: "unknown",
    useCase: "signUpWithEmailUseCase",
  });
});
