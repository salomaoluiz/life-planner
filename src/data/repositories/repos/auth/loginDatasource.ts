export type LoginDatasource = {
  loginWithIdToken(): Promise<boolean>;
  loginWithOAuth(): Promise<boolean>;
  logout(): Promise<void>;
  saveSession(params: SaveSessionParams): Promise<boolean>;
};
interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}
