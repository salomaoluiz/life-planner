import { UserDatasource } from "@data/repositories/repos/user/userDatasource";

import getUser from "./getUser";
import getUserById from "./getUserById";

function userDatasourceImpl(): UserDatasource {
  return {
    getUser,
    getUserById,
  };
}

export default userDatasourceImpl;
