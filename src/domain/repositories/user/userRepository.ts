import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

export type UserRepository = {
  createUser(params: CreateUserRepositoryParams): Promise<void>;
  getUser(): Promise<UserProfileEntity>;
  getUserById(id: string): Promise<undefined | UserProfileEntity>;
};

interface CreateUserRepositoryParams {
  avatarURL: string;
  email: string;
  id: string;
  name: string;
}
