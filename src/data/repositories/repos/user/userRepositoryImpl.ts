import { UserRepository } from "@domain/repositories/user";
import { Datasources } from "@data/datasource";
import UserEntity from "@domain/entities/user/userEntity";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async getUser(): Promise<UserEntity> {
      const userModel = await datasources.userDatasource.getUser();

      return new UserEntity({
        id: userModel.id,
        name: userModel.name,
        email: userModel.email,
        photoUrl: userModel.avatar,
      });
    },
  };
}

export default userRepositoryImpl;
