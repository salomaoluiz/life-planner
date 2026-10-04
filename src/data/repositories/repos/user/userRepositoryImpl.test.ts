import { mocks, setup, spies } from "./mocks/userRepositoryImpl.mocks";

it("SHOULD call getUser correctly", async () => {
  const { getUser } = setup();

  await getUser();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(spies.getUser).toHaveBeenCalledWith(mocks.datasources);
});

it("SHOULD call getUserById correctly", async () => {
  const { getUserById } = setup();

  const userId = "bb3443d4-a9bd-401e-9732-d6bf0dca7e83";

  const user = await getUserById(userId);

  expect(spies.getUserById).toHaveBeenCalledTimes(1);
  expect(spies.getUserById).toHaveBeenCalledWith(userId, mocks.datasources);
  expect(user).toEqual("getUserById response");
});
