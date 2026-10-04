import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Drops cached server state and refetches active queries (user provider → logged=false → redirect).
async function resetFetcherData() {
  return queryClient.resetQueries();
}

export default resetFetcherData;
