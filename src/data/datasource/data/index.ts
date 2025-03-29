import * as auth from "./auth";
import * as family from "./family";
import * as familyMember from "./family-member";
import * as financial from "./financial";
import * as stock from "./stock";
import * as user from "./user";

const listDatasources = {
  ...auth,
  ...user,
  ...family,
  ...familyMember,
  ...financial,
  ...stock,
};

export { listDatasources };
