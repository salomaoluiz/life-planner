import { Datasources } from "@data/datasource";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { UserRepository } from "@domain/repositories/user";

import deleteAccount from "./deleteAccount";
import getOwners from "./getOwners";
import getUser from "./getUser";
import getUserById from "./getUserById";

function userRepositoryImpl(datasources: Datasources): UserRepository {
  return {
    async deleteAccount(email: string): Promise<void> {
      return deleteAccount(email, datasources);
    },
    async getOwners() {
      return getOwners(datasources);
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
