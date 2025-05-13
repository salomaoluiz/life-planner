import * as auth from "./auth";
import * as cache from "./cache";
import * as configs from "./configs";
import * as family from "./family";
import * as familyMember from "./familyMember";
import * as financial from "./financial";
import * as stock from "./stock";
import * as user from "./user";

const listRepositories = {
  ...auth,
  ...cache,
  ...configs,
  ...family,
  ...familyMember,
  ...financial,
  ...stock,
  ...user,
};

export { listRepositories };
