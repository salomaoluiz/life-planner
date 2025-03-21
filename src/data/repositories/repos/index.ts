import * as auth from "./auth";
import * as family from "./family";
import * as familyMember from "./familyMember";
import * as stock from "./stock";
import * as user from "./user";

const listRepositories = {
  ...auth,
  ...user,
  ...family,
  ...familyMember,
  ...stock,
};

export { listRepositories };
