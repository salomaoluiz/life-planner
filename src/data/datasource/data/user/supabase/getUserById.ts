import UserModel from "@data/models/user/UserModel";
import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<UserDatasource["getUserById"]>[0];
export type Response = ReturnType<UserDatasource["getUserById"]>;

async function getUserById(id: Params): Response {
  try {
    const response = await supabase.from("users").select().eq("id", id).then();

    if (response.error) {
      throw response.error;
    }

    const user = response.data[0];

    if (!user) return;

    return UserModel.fromJSON({
      avatar_url: user.avatar_url,
      email: user.email,
      id: user.id,
      name: user.name,
    });
  } catch (error) {
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
