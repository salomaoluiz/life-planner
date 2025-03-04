import { LoginDatasource } from "@data/repositories/repos/auth/loginDatasource";
import { signIn } from "@infrastructure/googleOAuth";
import { supabase } from "@infrastructure/supabase";
import {
  BusinessError,
  GenericError,
  LoginCanceledError,
} from "@domain/entities/errors";

function loginDatasourceImpl(): LoginDatasource {
  return {
    async loginWithIdToken(): Promise<boolean> {
      const response = await signIn();

      if (response.status === "error") {
        throw new GenericError(response.error.message);
      }
      if (response.status === "canceled") {
        throw new LoginCanceledError();
      }

      await supabase.auth.signInWithIdToken({
        token: response.data.token,
        provider: "google",
      });
      return true;
    },
    async loginWithOAuth(): Promise<boolean> {
      const envs = process.env;
      const response = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${envs.EXPO_PUBLIC_PROJECT_WEBSITE_URL}/login`,
        },
      });

      if (response.error) {
        throw new GenericError(response.error.message);
      }

      return true;
    },
    async saveSession(params): Promise<boolean> {
      const response = await supabase.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });

      if (response.error) {
        if (response.error.name === "AuthSessionMissingError") {
          throw new BusinessError("Session is missing");
        }
        throw new GenericError(response.error.message);
      }

      return true;
    },
    async logout(): Promise<void> {
      const result = await supabase.auth.signOut();

      if (result.error) {
        throw new GenericError(result.error.message);
      }
    },
  };
}

export default loginDatasourceImpl;
