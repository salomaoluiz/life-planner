import { mocks, setup, spies } from "./mocks/loginRepositoryImpl.mocks";

it("SHOULD call loginWithGoogle correctly", async () => {
  const repository = setup();

  const result = await repository.loginWithGoogle();

  expect(spies.loginWithGoogle).toHaveBeenCalledTimes(1);
  expect(spies.loginWithGoogle).toHaveBeenCalledWith(mocks.datasourcesMocks);
  expect(result).toEqual("loginWithGoogle response");
});

it("SHOULD call logout correctly", async () => {
  const repository = setup();

  const result = await repository.logout();

  expect(spies.logout).toHaveBeenCalledTimes(1);
  expect(spies.logout).toHaveBeenCalledWith(mocks.datasourcesMocks);
  expect(result).toEqual("logout response");
});

it("SHOULD call saveSession correctly", async () => {
  const repository = setup();

  const params = {
    accessToken: "accessToken",
    refreshToken: "refreshToken",
  };

  const result = await repository.saveSession(params);

  expect(spies.saveSession).toHaveBeenCalledTimes(1);
  expect(spies.saveSession).toHaveBeenCalledWith(
    params,
    mocks.datasourcesMocks,
  );
  expect(result).toEqual("saveSession response");
});
