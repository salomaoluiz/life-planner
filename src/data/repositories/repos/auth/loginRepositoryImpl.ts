import { Datasources } from "@data/datasource";
import { LoginRepository } from "@domain/repositories/auth";

import loginWithEmail from "./loginWithEmail";
import logout from "./logout";
import signUpWithEmail from "./signUpWithEmail";

function loginRepositoryImpl(datasources: Datasources): LoginRepository {
  return {
    async loginWithEmail(params) {
      return loginWithEmail(params, datasources);
    },
    async logout(): Promise<void> {
      return logout(datasources);
    },
    async signUpWithEmail(params) {
      return signUpWithEmail(params, datasources);
    },
  };
}

export default loginRepositoryImpl;
