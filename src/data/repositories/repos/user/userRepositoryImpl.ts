import { Datasources } from "@data/datasource";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";

import createUser from "./createUser";
import getUser from "./getUser";
import getUserById from "./getUserById";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async createUser(params): Promise<void> {
      return createUser(params, datasources);
    },
    async getUser(): Promise<UserProfileEntity> {
      return getUser(datasources);
    },
    async getUserById(id: string) {
      return getUserById(id, datasources);
    },
  };
}

export default userRepositoryImpl;
