import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

export type UserRepository = {
  deleteAccount(email: string): Promise<void>;
  getUser(): Promise<UserProfileEntity>;
  getUserById(id: string): Promise<undefined | UserProfileEntity>;
};
