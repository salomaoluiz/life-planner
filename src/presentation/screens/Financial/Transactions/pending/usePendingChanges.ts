import { useSyncExternalStore } from "react";

import {
  getChanges,
  getFailures,
  PendingChange,
  PendingFailure,
  shiftFailure,
  subscribe,
} from "./pendingChanges";

function usePendingChanges(): readonly PendingChange[] {
  return useSyncExternalStore(subscribe, getChanges, getChanges);
}

function usePendingFailures(): {
  dismiss: () => void;
  failure?: PendingFailure;
} {
  const failures = useSyncExternalStore(subscribe, getFailures, getFailures);

  return { dismiss: shiftFailure, failure: failures[0] };
}

export { usePendingChanges, usePendingFailures };
