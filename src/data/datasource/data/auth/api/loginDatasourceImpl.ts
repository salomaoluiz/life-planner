import { LoginDatasource } from "@data/repositories/repos/auth/loginDatasource";

import loginWithEmail from "./loginWithEmail";
import logout from "./logout";
import signUpWithEmail from "./signUpWithEmail";

function loginDatasourceImpl(): LoginDatasource {
  return {
    loginWithEmail,
    logout,
    signUpWithEmail,
  };
}

export default loginDatasourceImpl;
