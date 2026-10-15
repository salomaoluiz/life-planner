import { useEffect } from "react";
import { AppState } from "react-native";

import { refreshSessionIfNeeded } from "./refresh";

// Coming back to the foreground counts as "opening the app": renew the access token before
// the first request needs it.
function useRefreshOnForeground() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshSessionIfNeeded();
      }
    });

    return () => subscription.remove();
  }, []);
}

export { useRefreshOnForeground };
