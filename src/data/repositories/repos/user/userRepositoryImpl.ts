import { Datasources } from "@data/datasource";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";

import getUser from "./getUser";
import getUserById from "./getUserById";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async getUser(): Promise<UserProfileEntity> {
      return getUser(datasources);
    },
    async getUserById(id: string) {
      return getUserById(id, datasources);
    },
  };
}

export default userRepositoryImpl;
