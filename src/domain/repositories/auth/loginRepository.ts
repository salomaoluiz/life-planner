interface SaveSessionParams {
  accessToken: string;
  refreshToken: string;
}

export type LoginRepository = {
  loginWithGoogle(): Promise<boolean>;
  saveSession(params: SaveSessionParams): Promise<boolean>;
  logout(): Promise<void>;
};
