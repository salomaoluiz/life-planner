import * as authUseCases from "./auth";
import * as familyUseCases from "./family";
import * as familyMemberUseCases from "./familyMember";
import * as homeUseCases from "./home";
import * as stockUseCases from "./stock";
import * as userUseCases from "./user";

const listUseCases = {
  ...authUseCases,
  ...homeUseCases,
  ...userUseCases,
  ...familyUseCases,
  ...familyMemberUseCases,
  ...stockUseCases,
};

export { listUseCases };
