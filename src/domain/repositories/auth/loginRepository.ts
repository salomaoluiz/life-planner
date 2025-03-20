import LoginWithGoogleEntity from "@domain/entities/auth/LoginWithGoogleEntity";

export type LoginRepository = {
  loginWithGoogle(): Promise<LoginWithGoogleEntity | undefined>;
  logout(): Promise<void>;
  saveSession(params: SaveSessionParams): Promise<LoginWithGoogleEntity>;
};

interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}
