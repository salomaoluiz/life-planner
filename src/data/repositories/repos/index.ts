import * as auth from "./auth";
import * as user from "./user";

const listRepositories = {
  ...auth,
  ...user,
};

export { listRepositories };
