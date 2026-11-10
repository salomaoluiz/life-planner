import { useEffect, useRef, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import {
  QuoteRefreshTooSoon,
  QuoteSourceUnavailable,
} from "@domain/entities/errors";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";

const TICK_MS = 1000;

// Spec 104 FR 17-19: "Refresh now" with the 1 per minute limit. After a refresh the button is disabled until
// `nextRefreshAt`; a 429 (another device used it) disables it for `retryAfterSeconds`.
function useQuoteRefresh(assetIds?: string[]) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sourceDown, setSourceDown] = useState(false);
  const mutation = useMutation({
    cacheKey: [useCases.refreshInvestmentQuotesUseCase.uniqueName],
    fetch: useCases.refreshInvestmentQuotesUseCase.execute,
  });
  const handled = useRef<string>("");

  useEffect(() => {
    if (mutation.status === "success" && mutation.data) {
      const key = mutation.data.nextRefreshAt;

      if (handled.current !== key) {
        handled.current = key;
        setSecondsLeft(
          Math.max(
            0,
            Math.ceil((new Date(key).getTime() - Date.now()) / TICK_MS),
          ),
        );
        setSourceDown(mutation.data.quotes.some((quote) => quote.stale));
        void invalidateFetcherData(investmentKeys.all());
      }
    }
  }, [mutation.status, mutation.data]);

  useEffect(() => {
    if (mutation.error instanceof QuoteRefreshTooSoon) {
      setSecondsLeft(mutation.error.retryAfterSeconds);
    }
    if (mutation.error instanceof QuoteSourceUnavailable) {
      setSourceDown(true);
    }
  }, [mutation.error]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), TICK_MS);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function onRefresh() {
    if (mutation.isFetching || secondsLeft > 0) {
      return;
    }

    setSourceDown(false);
    mutation.mutate({ assetIds });
  }

  return {
    disabled: mutation.isFetching || secondsLeft > 0,
    isRefreshing: mutation.isFetching,
    onRefresh,
    secondsLeft,
    sourceDown,
  };
}

export default useQuoteRefresh;
