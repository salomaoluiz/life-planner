import * as auth from "./auth";
import * as cache from "./cache";
import * as configs from "./configs";
import * as family from "./family";
import * as familyMember from "./familyMember";
import * as financial from "./financial";
import * as stock from "./stock";
import * as user from "./user";
import * as version from "./version";

const listRepositories = {
  ...auth,
  ...cache,
  ...configs,
  ...family,
  ...familyMember,
  ...financial,
  ...stock,
  ...user,
  ...version,
};

export { listRepositories };
