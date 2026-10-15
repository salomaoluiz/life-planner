import { UserDatasource } from "@data/repositories/repos/user/userDatasource";

import deleteAccount from "./deleteAccount";
import getUser from "./getUser";
import getUserById from "./getUserById";

function userDatasourceImpl(): UserDatasource {
  return {
    deleteAccount,
    getUser,
    getUserById,
  };
}

export default userDatasourceImpl;
