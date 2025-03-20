import LoginWithGoogleModel from "@data/models/auth/LoginWithGoogleModel";

export type LoginDatasource = {
  loginWithIdToken(): Promise<LoginWithGoogleModel>;
  loginWithOAuth(): Promise<boolean>;
  logout(): Promise<void>;
  saveSession(params: SaveSessionParams): Promise<LoginWithGoogleModel>;
};

interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}
