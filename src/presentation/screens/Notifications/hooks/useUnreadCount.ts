import { notificationKeys } from "@application/queryKeys/notificationKeys";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

// Spec 124 FR 21: the bell count. It refetches when the query is stale (focus, mount); a push that arrives or a
// read invalidates it, so there is no interval polling.
function useUnreadCount() {
  const query = useQuery<number>({
    cacheKey: notificationKeys.unread(),
    // The bell is in every header: a failing API must never break the screen around it.
    fetch: async () => {
      try {
        return await useCases.getUnreadNotificationCountUseCase.execute();
      } catch {
        return 0;
      }
    },
  });

  return { count: query.data ?? 0, refetch: query.refetch };
}

export default useUnreadCount;
