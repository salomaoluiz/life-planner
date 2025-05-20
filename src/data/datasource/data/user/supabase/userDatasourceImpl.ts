import { UserDatasource } from "@data/repositories/repos/user/userDatasource";

import createUser from "./createUser";
import getUser from "./getUser";
import getUserById from "./getUserById";

function userDatasourceImpl(): UserDatasource {
  return {
    createUser,
    getUser,
    getUserById,
  };
}

export default userDatasourceImpl;
