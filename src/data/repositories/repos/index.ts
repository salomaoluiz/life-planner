import * as auth from "./auth";
import * as family from "./family";
import * as familyMember from "./familyMember";
import * as user from "./user";

const listRepositories = {
  ...auth,
  ...user,
  ...family,
  ...familyMember,
};

export { listRepositories };
