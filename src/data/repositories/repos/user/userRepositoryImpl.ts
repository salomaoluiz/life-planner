import { Datasources } from "@data/datasource";
import UserModel from "@data/models/user";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async createUser(params): Promise<void> {
      await datasources.userDatasource.createUser({
        avatarURL: params.avatarURL,
        email: params.email,
        id: params.id,
        name: params.name,
      });
    },
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
        photoUrl: userModel.avatarURL,
      });
    },
    async getUserById(id: string) {
      const cachedData = cache.get<Record<string, unknown>>(
        CacheStringKeys.CACHE_USER_BY_ID_DATA,
        {
          uniqueId: id,
        },
      );
      let userModel: undefined | UserModel;
      if (cachedData) {
        userModel = UserModel.fromJson(cachedData);
      } else {
        userModel = await datasources.userDatasource.getUserById(id);
      }

      if (!userModel) return;

      cache.set(CacheStringKeys.CACHE_USER_BY_ID_DATA, userModel.toJson(), {
        uniqueId: id,
      });

      return new UserProfileEntity({
        email: userModel.email,
        id: userModel.id,
        name: userModel.name,
        photoUrl: userModel.avatarURL,
      });
    },
  };
}

export default userRepositoryImpl;
