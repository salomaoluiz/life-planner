export type LoginRepository = {
  loginWithGoogle(): Promise<void>;
  logout(): Promise<void>;
  saveSession(params: SaveSessionParams): Promise<boolean>;
};

interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}
