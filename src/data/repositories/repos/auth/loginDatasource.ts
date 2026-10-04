import {
  LoginWithEmailParams,
  SignUpWithEmailParams,
} from "@domain/repositories/auth";

export type LoginDatasource = {
  loginWithEmail(params: LoginWithEmailParams): Promise<void>;
  logout(): Promise<void>;
  signUpWithEmail(params: SignUpWithEmailParams): Promise<void>;
};
