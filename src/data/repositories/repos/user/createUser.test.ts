import { mocks, setup, spies } from "./mocks/createUser.mocks";

it("SHOULD create a user", async () => {
  await setup();

  expect(spies.userDatasource.createUser).toHaveBeenCalledTimes(1);
  expect(spies.userDatasource.createUser).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});
