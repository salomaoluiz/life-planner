import * as authUseCases from "./auth";
import * as userUseCases from "./user";

const listUseCases = {
  ...authUseCases,
  ...userUseCases,
};

export { listUseCases };
