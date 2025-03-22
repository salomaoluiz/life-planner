import UserModel from "@data/models/user";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import { GenericError, UserNotLoggedError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

function userDatasourceImpl(): UserDatasource {
  return {
    async createUser(params) {
      const response = await supabase.from("user").insert({
        avatar_url: params.avatarURL,
        email: params.email,
        id: params.id,
        name: params.name,
      });

      if (response.error) {
        throw new GenericError();
      }
    },
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
        avatarURL: userMetadata.avatar_url,
        email: userMetadata.email,
        id: user.id,
        name: userMetadata.name,
      });
    },
    async getUserById(id: string) {
      const response = await supabase.from("user").select().eq("id", id);

      if (response.error) {
        throw response.error;
      }

      const user = response.data[0];

      if (!user) return;

      return new UserModel({
        avatarURL: user.avatar_url,
        email: user.email,
        id: user.id,
        name: user.name,
      });
    },
  };
}

export default userDatasourceImpl;
