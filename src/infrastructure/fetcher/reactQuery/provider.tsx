import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { BusinessError, ConnectivityError } from "@domain/entities/errors";

// A result counts as fresh for this long: screens mounting (or regaining focus) inside it reuse it without a request.
export const DEFAULT_STALE_TIME = 30 * 1000;
// Unused results stay in memory this long, so going back to a screen shows its data at once.
export const DEFAULT_GC_TIME = 10 * 60 * 1000;
const MAX_RETRIES = 1;

// Only a failure that may pass on its own is retried, and only once: a lost connection or a server/unknown error.
// A business error (4xx, validation, not logged in) answers the same every time, so retrying only delays it.
export function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= MAX_RETRIES) {
    return false;
  }

  return (
    error instanceof ConnectivityError || !(error instanceof BusinessError)
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: DEFAULT_GC_TIME,
      retry: shouldRetry,
      staleTime: DEFAULT_STALE_TIME,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

function ReactQueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ReactQueryProvider;
