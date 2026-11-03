import OwnerEntity from "@domain/entities/user/OwnerEntity";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

export type UserRepository = {
  deleteAccount(email: string): Promise<void>;
  // The personal owner plus the families of the user, always fresh (never the cached profile).
  getOwners(): Promise<OwnerEntity[]>;
  getUser(): Promise<UserProfileEntity>;
  getUserById(id: string): Promise<undefined | UserProfileEntity>;
};
