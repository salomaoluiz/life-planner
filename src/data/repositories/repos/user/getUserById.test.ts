import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/getUserById.mocks";

it("SHOULD return the user WHEN has a user in the cache", async () => {
  spies.cache.get.mockReturnValue(mocks.userModel.toJSON());

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_BY_ID_DATA,
    {
      uniqueId: mocks.defaultParams,
    },
  );
  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(spies.userDatasource.getUser).not.toHaveBeenCalled();
  expect(result).toEqual(
    new UserProfileEntity({
      email: mocks.userModel.email,
      id: mocks.userModel.id,
      name: mocks.userModel.name,
      photoUrl: mocks.userModel.avatarURL,
    }),
  );
});

it("SHOULD return the user WHEN has no user in the cache", async () => {
  spies.cache.get.mockReturnValue(undefined);
  spies.userDatasource.getUserById.mockResolvedValue(mocks.userModel);

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_BY_ID_DATA,
    {
      uniqueId: mocks.defaultParams,
    },
  );
  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_BY_ID_DATA,
    mocks.userModel.toJSON(),
    { uniqueId: mocks.defaultParams },
  );
  expect(spies.userDatasource.getUserById).toHaveBeenCalledTimes(1);
  expect(spies.userDatasource.getUserById).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(result).toEqual(
    new UserProfileEntity({
      email: mocks.userModel.email,
      id: mocks.userModel.id,
      name: mocks.userModel.name,
      photoUrl: mocks.userModel.avatarURL,
    }),
  );
});

it("SHOULD return undefined WHEN user is not found", async () => {
  spies.cache.get.mockReturnValue(undefined);
  spies.userDatasource.getUserById.mockResolvedValue(undefined);

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_BY_ID_DATA,
    {
      uniqueId: mocks.defaultParams,
    },
  );
  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(spies.userDatasource.getUserById).toHaveBeenCalledTimes(1);
  expect(spies.userDatasource.getUserById).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(result).toBeUndefined();
});
