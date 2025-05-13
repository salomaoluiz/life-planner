import { Datasources } from "@data/datasource";
import { UserRepository } from "@domain/repositories/user";

export type Params = Parameters<UserRepository["createUser"]>[0];

async function createUser(params: Params, datasources: Datasources) {
  await datasources.userDatasource.createUser({
    avatarURL: params.avatarURL,
    email: params.email,
    id: params.id,
    name: params.name,
  });
}

export default createUser;
