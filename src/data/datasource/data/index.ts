import * as auth from "./auth";
import * as user from "./user";

const listDatasources = {
  ...auth,
  ...user,
};

export { listDatasources };
