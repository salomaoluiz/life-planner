import * as auth from "./auth";
import * as families from "./families";
import * as familyMembers from "./familyMember";
import * as financial from "./financial";
import * as investment from "./investment";
import * as notification from "./notification";
import * as storage from "./storage";
import * as user from "./user";
import * as version from "./version";

const listDatasources = {
  ...auth,
  ...user,
  ...families,
  ...familyMembers,
  ...financial,
  ...investment,
  ...notification,
  ...storage,
  ...version,
};

export { listDatasources };
