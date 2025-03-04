import { setup, spies } from "./mocks/loginRepositoryImpl_loginWithGoogle";

it("SHOULD login with oauth in web", async () => {
  spies.isWeb.mockReturnValue(true);

  const result = await setup();

  expect(spies.loginWithOAuth).toHaveBeenCalled();
  expect(result).toBeTruthy();
});

it("SHOULD login with id token in non-web", async () => {
  spies.isWeb.mockReturnValue(false);

  const result = await setup();

  expect(spies.loginWithIdToken).toHaveBeenCalled();
  expect(result).toBeTruthy();
});
