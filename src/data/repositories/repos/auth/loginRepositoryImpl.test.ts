import { mocks, setup, spies } from "./mocks/loginRepositoryImpl.mocks";

it("SHOULD call loginWithEmail correctly", async () => {
  const params = { email: "test@example.com", password: "password123" };

  const result = await setup().loginWithEmail(params);

  expect(spies.loginWithEmail).toHaveBeenCalledWith(
    params,
    mocks.datasourcesMocks,
  );
  expect(result).toEqual("loginWithEmail response");
});

it("SHOULD call logout correctly", async () => {
  const result = await setup().logout();

  expect(spies.logout).toHaveBeenCalledTimes(1);
  expect(spies.logout).toHaveBeenCalledWith(mocks.datasourcesMocks);
  expect(result).toEqual("logout response");
});

it("SHOULD call signUpWithEmail correctly", async () => {
  const params = {
    email: "test@example.com",
    name: "Test User",
    password: "password123",
  };

  const result = await setup().signUpWithEmail(params);

  expect(spies.signUpWithEmail).toHaveBeenCalledWith(
    params,
    mocks.datasourcesMocks,
  );
  expect(result).toEqual("signUpWithEmail response");
});
