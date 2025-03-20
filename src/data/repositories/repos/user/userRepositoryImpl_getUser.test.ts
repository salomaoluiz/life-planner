import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/userRepositoryImpl_getUser";

it("SHOULD get user from datasource WHEN cache is empty", async () => {
  spies.getCache.mockReturnValue(null);
  spies.getUser.mockResolvedValue(mocks.getUserSuccess);

  const result = await setup();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(result).toEqual(
    new UserProfileEntity({
      email: mocks.getUserSuccess.email,
      id: mocks.getUserSuccess.id,
      name: mocks.getUserSuccess.name,
      photoUrl: mocks.getUserSuccess.avatarURL,
    }),
  );
});

it("SHOULD get user from cache WHEN cache is not empty", async () => {
  spies.getCache.mockReturnValue(mocks.getUserSuccess);

  const result = await setup();

  expect(spies.getCache).toHaveBeenCalledTimes(1);
  expect(spies.getCache).toHaveBeenCalledWith(CacheStringKeys.CACHE_USER_DATA);
  expect(spies.getUser).not.toHaveBeenCalled();
  expect(result).toEqual(
    new UserProfileEntity({
      email: mocks.getUserSuccess.email,
      id: mocks.getUserSuccess.id,
      name: mocks.getUserSuccess.name,
      photoUrl: mocks.getUserSuccess.avatarURL,
    }),
  );
});

it("SHOULD set cache WHEN cache is empty", async () => {
  spies.getCache.mockReturnValue(null);
  spies.getUser.mockResolvedValue(mocks.getUserSuccess);

  await setup();

  expect(spies.setCache).toHaveBeenCalledTimes(1);
  expect(spies.setCache).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    mocks.getUserSuccess,
  );
});
