import { Datasources } from "@data/datasource";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async getUser(): Promise<UserProfileEntity> {
      const userModel = await datasources.userDatasource.getUser();

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
