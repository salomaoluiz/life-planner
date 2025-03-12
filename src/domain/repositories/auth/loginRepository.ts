export type LoginRepository = {
  loginWithGoogle(): Promise<boolean>;
  logout(): Promise<void>;
  saveSession(params: SaveSessionParams): Promise<boolean>;
};

interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}
