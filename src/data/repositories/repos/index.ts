import * as auth from "./auth";
import * as configs from "./configs";
import * as family from "./family";
import * as familyMember from "./familyMember";
import * as financial from "./financial";
import * as stock from "./stock";
import * as user from "./user";

const listRepositories = {
  ...auth,
  ...configs,
  ...user,
  ...family,
  ...familyMember,
  ...financial,
  ...stock,
};

export { listRepositories };
