import { UserRepository } from "@domain/repositories/user";
import { Datasources } from "@data/datasource";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async getUser(): Promise<UserProfileEntity> {
      const userModel = await datasources.userDatasource.getUser();

      return new UserProfileEntity({
        id: userModel.id,
        name: userModel.name,
        email: userModel.email,
        photoUrl: userModel.photoURL,
      });
    },
  };
}

export default userRepositoryImpl;
