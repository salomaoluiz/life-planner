import { useSyncExternalStore } from "react";

import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

// Spec 110 FR 1: the owner chosen in the investments module is shared by its sections (Overview and Assets), so it
// lives outside the screens and survives switching between them while the app is open.
let current = ALL_OWNERS;
const listeners = new Set<() => void>();

function emit(next: string) {
  current = next;
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return current;
}

function resetInvestmentOwnerFilter() {
  emit(ALL_OWNERS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function useInvestmentOwnerFilter(): [string, (owner: string) => void] {
  const owner = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return [owner, emit];
}

export default useInvestmentOwnerFilter;
export { resetInvestmentOwnerFilter };
