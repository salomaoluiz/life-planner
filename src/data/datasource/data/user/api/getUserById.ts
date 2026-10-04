import UserModel from "@data/models/user/UserModel";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import {
  ApiBusinessError,
  BusinessError,
  GenericError,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

export type Params = Parameters<UserDatasource["getUserById"]>[0];
export type Response = ReturnType<UserDatasource["getUserById"]>;

async function getUserById(id: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(`/v1/user/${id}`);

    return UserModel.fromJSON(data);
  } catch (error) {
    if (error instanceof ApiBusinessError && error.statusCode === 404) {
      return undefined;
    }
    if (error instanceof BusinessError) {
      throw error;
    }

    const genericError = new GenericError();
    genericError.addContext({
      datasource: "UserDatasource - getUserById",
      error,
      id,
    });
    throw genericError;
  }
}

export default getUserById;
