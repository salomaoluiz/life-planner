import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<UserDatasource["createUser"]>[0];
export type Response = ReturnType<UserDatasource["createUser"]>;

async function createUser(params: Params): Response {
  try {
    const response = await supabase
      .from("users")
      .insert({
        avatar_url: params.avatarURL,
        email: params.email,
        id: params.id,
        name: params.name,
      })
      .then();

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "UserDatasource - createUser",
      error,
      params,
    });

    throw genericError;
  }
}

export default createUser;
