import UserModel from "@data/models/user/UserModel";

export interface UserDatasource {
  deleteAccount: (email: string) => Promise<void>;
  getUser: () => Promise<UserModel>;
  getUserById: (id: string) => Promise<undefined | UserModel>;
}
