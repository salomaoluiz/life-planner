import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteAccountUseCase.mocks";

it("SHOULD delete the account with the email AND then log out locally", async () => {
  await setup("test@example.com");

  expect(spies.userRepository.deleteAccount).toHaveBeenCalledWith(
    "test@example.com",
  );
  expect(spies.loginRepository.logout).toHaveBeenCalledTimes(1);
  expect(
    spies.userRepository.deleteAccount.mock.invocationCallOrder[0],
  ).toBeLessThan(spies.loginRepository.logout.mock.invocationCallOrder[0]);
});

it("SHOULD NOT log out WHEN the delete fails (the account still exists) AND rethrow the same error", async () => {
  spies.userRepository.deleteAccount.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  expect(await setupThrowable()).toBe(mocks.errors.unknown);
  expect(spies.loginRepository.logout).not.toHaveBeenCalled();
});

it("SHOULD add the use case to a BusinessError context", async () => {
  spies.userRepository.deleteAccount.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("context", {
    any_context: "any context",
    useCase: "deleteAccountUseCase",
  });
});
