import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

export type UserRepository = {
  getUser(): Promise<UserProfileEntity>;
};
