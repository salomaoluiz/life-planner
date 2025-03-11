interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}
export type LoginDatasource = {
  loginWithIdToken(): Promise<boolean>;
  loginWithOAuth(): Promise<boolean>;
  saveSession(params: SaveSessionParams): Promise<boolean>;
  logout(): Promise<void>;
};
