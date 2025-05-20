import * as auth from "./auth";
import * as families from "./families";
import * as familyMembers from "./familyMember";
import * as financial from "./financial";
import * as storage from "./storage";
import * as user from "./user";

const listDatasources = {
  ...auth,
  ...user,
  ...families,
  ...familyMembers,
  ...financial,
  ...storage,
};

export { listDatasources };
