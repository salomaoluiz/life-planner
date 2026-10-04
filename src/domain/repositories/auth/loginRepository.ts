export type LoginRepository = {
  loginWithEmail(params: LoginWithEmailParams): Promise<void>;
  logout(): Promise<void>;
  signUpWithEmail(params: SignUpWithEmailParams): Promise<void>;
};

export type LoginWithEmailParams = {
  email: string;
  password: string;
};

export type SignUpWithEmailParams = {
  email: string;
  name: string;
  password: string;
};
