import UserModel from "@data/models/user/UserModel";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import {
  BusinessError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Response = ReturnType<UserDatasource["getUser"]>;

async function getUser(): Response {
  try {
    const response = await supabase.auth.getUser();

    if (response.error) {
      if (
        response.error.name === "AuthSessionMissingError" ||
        response.error.code === "user_not_found"
      ) {
        throw new UserNotLoggedError();
      }

      throw response.error;
    }

    const user = response.data.user;
    const userMetadata = user.user_metadata;

    return UserModel.fromJSON({
      avatar_url: userMetadata.avatar_url,
      email: userMetadata.email,
      id: user.id,
      name: userMetadata.name,
    });
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }

    const genericError = new GenericError();
    genericError.addContext({
      datasource: "UserDatasource - getUser",
      error,
    });

    throw genericError;
  }
}

export default getUser;
