import { Datasources } from "@data/datasource";
import UserModel from "@data/models/user/UserModel";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

async function getUser(datasources: Datasources) {
  const cacheData = cache.get<Record<string, unknown>>(
    CacheStringKeys.CACHE_USER_DATA,
  );

  let userModel: undefined | UserModel;

  if (cacheData) {
    userModel = UserModel.fromJSON(cacheData);
  } else {
    userModel = await datasources.userDatasource.getUser();
    cache.set<Record<string, unknown>>(
      CacheStringKeys.CACHE_USER_DATA,
      userModel.toJSON(),
    );
  }

  return new UserProfileEntity({
    email: userModel.email,
    id: userModel.id,
    name: userModel.name,
    photoUrl: userModel.avatarURL,
  });
}

export default getUser;
