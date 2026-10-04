import UserModel from "@data/models/user/UserModel";

export interface UserDatasource {
  getUser: () => Promise<UserModel>;
  getUserById: (id: string) => Promise<undefined | UserModel>;
}
