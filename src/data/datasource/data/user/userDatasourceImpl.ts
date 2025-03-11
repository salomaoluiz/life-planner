import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import { supabase } from "@infrastructure/supabase";
import UserModel from "@data/models/user";
import { GenericError, UserNotLoggedError } from "@domain/entities/errors";

function userDatasourceImpl(): UserDatasource {
  return {
    async getUser() {
      const response = await supabase.auth.getUser();
      if (response.error) {
        if (response.error.name === "AuthSessionMissingError") {
          throw new UserNotLoggedError();
        }
        throw new GenericError(response.error.message);
      }

      const user = response.data.user.user_metadata;

      return new UserModel({
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.avatar_url,
      });
    },
  };
}

export default userDatasourceImpl;
