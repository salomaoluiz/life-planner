import { Href, router, useRootNavigationState } from "expo-router";
import { useEffect } from "react";

import { useUser } from "@application/providers/user";
import { captureException } from "@infrastructure/monitoring";
import { tokenStorage } from "@infrastructure/token";
import { isWeb } from "@utils/platform";

import { parseE2eLoginFragment } from "../utils/parseFragment";

// Module level: the root Stack unmounts while the user loads, which remounts this screen.
let started = false;

function isE2eLoginEnabled() {
  return __DEV__ && process.env.EXPO_PUBLIC_E2E_LOGIN === "true";
}

async function storeSession(update: () => Promise<void>) {
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
  } catch (error) {
    captureException(error as Error);
    router.replace("/login");
  }
}

function useE2eLoginViewModel() {
  const { logged, update } = useUser();
  // The root Stack mounts only after the user query settles: navigating earlier throws.
  const navigationReady = !!useRootNavigationState()?.key;

  useEffect(() => {
    if (!navigationReady) {
      return;
    }
    if (logged) {
      started = false;
      router.replace("/" as Href);
      return;
    }
    if (!started) {
      started = true;
      void storeSession(update);
    }
  }, [navigationReady, logged]);
}

export default useE2eLoginViewModel;
