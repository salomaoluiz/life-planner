import { useEffect } from "react";
import { InteractionManager } from "react-native";

import { prefetchFetcherData } from "@infrastructure/fetcher";
import isSlowConnection from "@infrastructure/network/isSlowConnection";
import useStableCallback from "@presentation/hooks/useStableCallback";

// The month on screen must stay settled this long before its neighbours are fetched (spec 087).
const PREFETCH_IDLE_MS = 1000;

interface Props {
  // The cache key of one month's query: the same one the screen's own query uses, so the data is found on a switch.
  cacheKey: (monthKey: string) => string[];
  // False while the month is loading, a write is pending, a filter replaces the month, or the screen is not focused.
  enabled: boolean;
  fetch: (monthKey: string) => Promise<unknown>;
  // `YYYY-MM` of the months to warm (the previous and the next one).
  monthKeys: string[];
}

// After the visible month settled and the app has been idle, fetches the neighbouring months into the cache so
// moving to them shows their rows at once. Nothing is persisted; a still-fresh month is not fetched again.
function usePrefetchAdjacentMonths(props: Props) {
  const cacheKey = useStableCallback(props.cacheKey);
  const fetch = useStableCallback(props.fetch);
  const monthsId = props.monthKeys.join("|");

  useEffect(() => {
    if (!props.enabled) {
      return;
    }
    let task: ReturnType<typeof InteractionManager.runAfterInteractions>;
    const timer = setTimeout(() => {
      task = InteractionManager.runAfterInteractions(() => {
        if (isSlowConnection()) {
          return;
        }
        props.monthKeys.forEach((monthKey) => {
          void prefetchFetcherData({
            cacheKey: cacheKey(monthKey),
            fetch: async () => fetch(monthKey),
          });
        });
      });
    }, PREFETCH_IDLE_MS);

    return () => {
      clearTimeout(timer);
      task?.cancel();
    };
  }, [props.enabled, monthsId]);
}

export { PREFETCH_IDLE_MS };
export default usePrefetchAdjacentMonths;
