import {
  ApiBusinessError,
  BusinessError,
  ConnectivityError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import handleFamilyMemberApiError from "../familyMemberApiError";

// region mocks
const mapped = new BusinessError();
const context = { datasource: "FamilyMemberDatasource - test", id: "family-1" };
const errorMap = { 404: () => mapped };

const errors = {
  api403: new ApiBusinessError("Forbidden", 403),
  api404: new ApiBusinessError("Not Found", 404),
  connectivity: new ConnectivityError(),
  notLogged: new UserNotLoggedError(),
  unknown: new Error("boom"),
};
// endregion mocks

function setup(error: unknown, map = errorMap) {
  try {
    handleFamilyMemberApiError(error, context, map);
  } catch (thrown) {
    return thrown;
  }
}

const mocks = { context, errors, mapped };

export { mocks, setup };
