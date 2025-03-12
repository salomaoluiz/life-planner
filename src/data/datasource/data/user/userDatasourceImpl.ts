import UserModel from "@data/models/user";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import { GenericError, UserNotLoggedError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

function userDatasourceImpl(): UserDatasource {
  return {
    async getUser() {
      const response = await supabase.auth.getUser();
      if (response.error) {
        if (response.error.name === "AuthSessionMissingError") {
          throw new UserNotLoggedError();
        }
        throw new GenericError();
      }

      const user = response.data.user.user_metadata;

      return new UserModel({
        email: user.email,
        id: user.id,
        name: user.name,
        photoURL: user.avatar_url,
      });
    },
  };
}

export default userDatasourceImpl;
