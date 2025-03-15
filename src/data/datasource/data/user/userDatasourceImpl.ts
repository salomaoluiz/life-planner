import UserModel from "@data/models/user";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import { GenericError, UserNotLoggedError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

function userDatasourceImpl(): UserDatasource {
  return {
    async getUser() {
      const response = await supabase.auth.getUser();

      if (response.error) {
        if (
          response.error.name === "AuthSessionMissingError" ||
          response.error.code === "user_not_found"
        ) {
          throw new UserNotLoggedError();
        }

        throw new GenericError();
      }

      const user = response.data.user;
      const userMetadata = user.user_metadata;

      return new UserModel({
        email: userMetadata.email,
        id: user.id,
        name: userMetadata.name,
        photoURL: userMetadata.avatar_url,
      });
    },
  };
}

export default userDatasourceImpl;
