import { Datasources } from "@data/datasource";
import { LoginRepository } from "@domain/repositories/auth";

import loginWithGoogle from "./loginWithGoogle";
import logout from "./logout";
import saveSession from "./saveSession";

function loginRepositoryImpl(datasources: Datasources): LoginRepository {
  return {
    async loginWithGoogle() {
      return loginWithGoogle(datasources);
    },
    async logout(): Promise<void> {
      return logout(datasources);
    },
    async saveSession(params) {
      return saveSession(params, datasources);
    },
  };
}

export default loginRepositoryImpl;
