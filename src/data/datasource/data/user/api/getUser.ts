import UserModel from "@data/models/user/UserModel";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import {
  BusinessError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

export type Response = ReturnType<UserDatasource["getUser"]>;

async function getUser(): Response {
  try {
    // No token: skip the network entirely (cold start / after logout) and let the app route to /login.
    if (!(await tokenStorage.getToken())) {
      throw new UserNotLoggedError();
    }

    const data = await api.get<Record<string, unknown>>("/v1/user/me");

    return UserModel.fromJSON(data);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }

    const genericError = new GenericError();
    genericError.addContext({ datasource: "UserDatasource - getUser", error });
    throw genericError;
  }
}

export default getUser;
