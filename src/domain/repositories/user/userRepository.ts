import UserEntity from "@domain/entities/user/userEntity";

export type UserRepository = {
  getUser(): Promise<UserEntity>;
};
