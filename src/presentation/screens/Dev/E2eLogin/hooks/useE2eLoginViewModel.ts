import { Href, router } from "expo-router";
import { useEffect } from "react";

import { useUser } from "@application/providers/user";
import { captureException } from "@infrastructure/monitoring";
import { tokenStorage } from "@infrastructure/token";
import { isWeb } from "@utils/platform";

import { parseE2eLoginFragment } from "../utils/parseFragment";

function isE2eLoginEnabled() {
  return __DEV__ && process.env.EXPO_PUBLIC_E2E_LOGIN === "true";
}

function useE2eLoginViewModel() {
  const { update } = useUser();

  useEffect(() => {
    async function login() {
      const tokens =
        isE2eLoginEnabled() && isWeb()
          ? parseE2eLoginFragment(window.location.hash)
          : null;
      if (!tokens) {
        router.replace("/login");
        return;
      }
      try {
        await tokenStorage.setToken(tokens.token);
        if (tokens.refresh) {
          await tokenStorage.setRefreshToken(tokens.refresh);
        }
        await update();
        router.replace("/" as Href);
      } catch (error) {
        captureException(error as Error);
        router.replace("/login");
      }
    }
    void login();
  }, []);
}

export default useE2eLoginViewModel;
