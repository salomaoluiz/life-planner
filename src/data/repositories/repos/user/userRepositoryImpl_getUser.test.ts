import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

import { mocks, setup, spies } from "./mocks/userRepositoryImpl_getUser";

it("SHOULD get user", async () => {
  spies.getUser.mockResolvedValue(mocks.getUserSuccess);

  const result = await setup();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(result).toEqual(
    new UserProfileEntity({
      email: mocks.getUserSuccess.email,
      id: mocks.getUserSuccess.id,
      name: mocks.getUserSuccess.name,
      photoUrl: mocks.getUserSuccess.photoURL,
    }),
  );
});
