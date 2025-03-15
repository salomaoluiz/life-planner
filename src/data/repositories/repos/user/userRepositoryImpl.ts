import { Datasources } from "@data/datasource";
import UserModel from "@data/models/user";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async getUser(): Promise<UserProfileEntity> {
      let userModel = cache.get<UserModel>(CacheStringKeys.CACHE_USER_DATA);

      if (!userModel) {
        userModel = await datasources.userDatasource.getUser();
        cache.set<UserModel>(CacheStringKeys.CACHE_USER_DATA, userModel);
      }

      return new UserProfileEntity({
        email: userModel.email,
        id: userModel.id,
        name: userModel.name,
        photoUrl: userModel.photoURL,
      });
    },
  };
}

export default userRepositoryImpl;
