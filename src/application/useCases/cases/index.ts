import * as authUseCases from "./auth";
import * as familyUseCases from "./family";
import * as familyMemberUseCases from "./familyMember";
import * as userUseCases from "./user";

const listUseCases = {
  ...authUseCases,
  ...userUseCases,
  ...familyUseCases,
  ...familyMemberUseCases,
};

export { listUseCases };
