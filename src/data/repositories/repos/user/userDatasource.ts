import UserModel from "@data/models/user";

export interface UserDatasource {
  createUser: (params: CreateUserDatasourceParams) => Promise<void>;
  getUser: () => Promise<UserModel>;
  getUserById: (id: string) => Promise<undefined | UserModel>;
}

interface CreateUserDatasourceParams {
  avatarURL: string;
  email: string;
  id: string;
  name: string;
}

export { CreateUserDatasourceParams };
