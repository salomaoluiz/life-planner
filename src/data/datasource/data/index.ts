import * as auth from "./auth";
import * as family from "./family";
import * as familyMember from "./family-member";
import * as user from "./user";

const listDatasources = {
  ...auth,
  ...user,
  ...family,
  ...familyMember,
};

export { listDatasources };
