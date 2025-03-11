import UserModel from "@data/models/user";

export interface UserDatasource {
  getUser: () => Promise<UserModel>;
}
