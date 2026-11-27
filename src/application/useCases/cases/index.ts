import * as activityUseCases from "./activity";
import * as authUseCases from "./auth";
import * as configsUseCases from "./configs";
import * as familyUseCases from "./family";
import * as familyMemberUseCases from "./familyMember";
import * as financialUseCases from "./financial";
import * as homeUseCases from "./home";
import * as investmentUseCases from "./investment";
import * as notificationUseCases from "./notification";
import * as stockUseCases from "./stock";
import * as userUseCases from "./user";
import * as versionUseCases from "./version";

const listUseCases = {
  ...activityUseCases,
  ...authUseCases,
  ...homeUseCases,
  ...configsUseCases,
  ...userUseCases,
  ...familyUseCases,
  ...familyMemberUseCases,
  ...stockUseCases,
  ...financialUseCases,
  ...investmentUseCases,
  ...notificationUseCases,
  ...versionUseCases,
};

export { listUseCases };
