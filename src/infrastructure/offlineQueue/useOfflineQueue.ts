import { useSyncExternalStore } from "react";

import { offlineQueue } from "./index";

// The queue as React state: the banner count and the "pendente" marks (spec 117 FR 22).
function useOfflineQueue() {
  const entries = useSyncExternalStore(
    offlineQueue.subscribe,
    offlineQueue.getSnapshot,
    offlineQueue.getSnapshot,
  );

  return {
    count: entries.length,
    entries,
    pendingItemIds: new Set(entries.map((entry) => entry.itemId)),
  };
}

export default useOfflineQueue;
