import { Href, router, useRootNavigationState } from "expo-router";
import { useEffect } from "react";

import { setE2eCsvFixture } from "@infrastructure/filePicker";
import { isWeb } from "@utils/platform";

import { currentHash } from "../utils/currentHash";
import { parseE2eCsvFragment } from "../utils/parseFragment";

function isE2eCsvEnabled() {
  // Direct read is inlined by Expo at build time; the alias keeps it readable at runtime (tests).
  const envs = process.env;
  const flag = process.env.EXPO_PUBLIC_E2E_LOGIN ?? envs.EXPO_PUBLIC_E2E_LOGIN;

  return __DEV__ && flag === "true";
}

// Dev-only (spec 047): leaves the CSV of the URL fragment for the next file pick of the import wizard, then goes home.
// The browser file chooser cannot be driven by Maestro.
function useE2eCsvViewModel() {
  const navigationReady = !!useRootNavigationState()?.key;

  useEffect(() => {
    if (!navigationReady) {
      return;
    }

    const fixture =
      isE2eCsvEnabled() && isWeb() ? parseE2eCsvFragment(currentHash()) : null;

    if (!fixture) {
      router.replace("/login");

      return;
    }

    const bytes = new TextEncoder().encode(fixture.csv);

    setE2eCsvFixture({ bytes, name: fixture.name, size: bytes.length });
    router.replace("/" as Href);
  }, [navigationReady]);
}

export { isE2eCsvEnabled };
export default useE2eCsvViewModel;
