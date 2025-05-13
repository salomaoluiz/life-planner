import { Datasources } from "@data/datasource";
import UserModel from "@data/models/user/UserModel";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<UserRepository["getUserById"]>[0];

async function getUserById(id: Params, datasources: Datasources) {
  const cachedData = cache.get<Record<string, unknown>>(
    CacheStringKeys.CACHE_USER_BY_ID_DATA,
    {
      uniqueId: id,
    },
  );
  let userModel: undefined | UserModel;
  if (cachedData) {
    userModel = UserModel.fromJSON(cachedData);
  } else {
    userModel = await datasources.userDatasource.getUserById(id);
    if (!userModel) return;

    cache.set(CacheStringKeys.CACHE_USER_BY_ID_DATA, userModel.toJSON(), {
      uniqueId: id,
    });
  }

  return new UserProfileEntity({
    email: userModel.email,
    id: userModel.id,
    name: userModel.name,
    photoUrl: userModel.avatarURL,
  });
}

export default getUserById;
