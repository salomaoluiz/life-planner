import LoginWithGoogleModel from "@data/models/auth/LoginWithGoogleModel";
import { LoginDatasource } from "@data/repositories/repos/auth/loginDatasource";
import {
  BusinessError,
  GenericError,
  LoginCanceledError,
} from "@domain/entities/errors";
import { signIn } from "@infrastructure/googleOAuth";
import { supabase } from "@infrastructure/supabase";

function loginDatasourceImpl(): LoginDatasource {
  return {
    async loginWithIdToken() {
      const response = await signIn();

      if (response.status === "error") {
        throw new GenericError();
      }
      if (response.status === "canceled") {
        throw new LoginCanceledError();
      }

      const supabaseResponse = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.data.token,
      });

      const user = supabaseResponse.data.user;
      const metadata = user?.user_metadata;

      return new LoginWithGoogleModel({
        avatarURL: metadata?.avatar_url as string,
        email: user?.email as string,
        id: user?.id as string,
        name: metadata?.name as string,
      });
    },
    async loginWithOAuth(): Promise<boolean> {
      const envs = process.env;
      const response = await supabase.auth.signInWithOAuth({
        options: {
          redirectTo: `${envs.EXPO_PUBLIC_PROJECT_WEBSITE_URL}/login`,
        },
        provider: "google",
      });

      if (response.error) {
        throw new GenericError();
      }

      return true;
    },
    async logout(): Promise<void> {
      const result = await supabase.auth.signOut();

      if (result.error?.name === "AuthSessionMissingError") {
        return;
      }

      if (result.error) {
        throw new GenericError();
      }
    },
    async saveSession(params) {
      const response = await supabase.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });

      if (response.error) {
        if (response.error.name === "AuthSessionMissingError") {
          throw new BusinessError();
        }
        throw new GenericError();
      }

      const user = response.data.user;
      const metadata = user?.user_metadata;

      return new LoginWithGoogleModel({
        avatarURL: metadata?.avatar_url as string,
        email: user?.email as string,
        id: user?.id as string,
        name: metadata?.name as string,
      });
    },
  };
}

export default loginDatasourceImpl;
