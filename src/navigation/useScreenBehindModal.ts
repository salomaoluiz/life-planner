import {
  router,
  useGlobalSearchParams,
  usePathname,
  useRootNavigationState,
} from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  buildModalPath,
  fallbackBase,
  splitModalPath,
} from "@screens/Navigation/models/modalPath";

// A fresh load (F5, direct link) builds the stack from the URL alone: [(tabs) at Home, (modals)].
// Rebuild it as [(tabs) at the base, (modals) at the modal], the same stack as opening it in the app.
function useScreenBehindModal(enabled = true): { ready: boolean } {
  const pathname = usePathname();
  const search = useGlobalSearchParams();
  const rootKey = useRootNavigationState()?.key;
  const done = useRef(false);
  const initial = useRef({ pathname, search });
  const [ready, setReady] = useState(
    () => splitModalPath(initial.current.pathname) === null,
  );

  useEffect(() => {
    const split = splitModalPath(initial.current.pathname);

    if (!enabled || !split || !rootKey || done.current) {
      return;
    }

    done.current = true;
    const base = fallbackBase(split);
    // The catch-all `modal` segments are part of the pathname, not a param to forward.
    const params = Object.fromEntries(
      Object.entries(initial.current.search).filter(
        ([key]) => key !== "modal" && !key.startsWith("__EXPO_ROUTER"),
      ),
    );

    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.navigate(base as never);
    router.push({
      params,
      pathname: buildModalPath(base, split.modal),
    } as never);
    setReady(true);
  }, [enabled, rootKey]);

  return { ready };
}

export default useScreenBehindModal;
