import { setup, spies } from "./mocks/loginRepositoryImpl_loginWithGoogle";

it("SHOULD login with oauth in web", async () => {
  spies.isWeb.mockReturnValue(true);

  await setup();

  expect(spies.loginWithOAuth).toHaveBeenCalledTimes(1);
  expect(spies.loginWithIdToken).not.toHaveBeenCalled();
});

it("SHOULD login with id token in non-web", async () => {
  spies.isWeb.mockReturnValue(false);

  await setup();

  expect(spies.loginWithIdToken).toHaveBeenCalledTimes(1);
  expect(spies.loginWithOAuth).not.toHaveBeenCalled();
});
