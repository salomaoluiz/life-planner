import { useEffect, useState, useSyncExternalStore } from "react";

import {
  clearGroup,
  EMPTY_FILTERS,
  FilterGroup,
  TransactionFilters,
} from "@screens/Financial/Transactions/models/transactionFilters";

const SEARCH_DEBOUNCE_MS = 300;

// The dashboard filters are their own state, not shared with Transactions, and live while the app is open (spec 046 FR 4).
let current: TransactionFilters = EMPTY_FILTERS;
const listeners = new Set<() => void>();

function emit(next: TransactionFilters) {
  current = next;
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return current;
}

function resetOverviewFilters() {
  emit(EMPTY_FILTERS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function useOverviewFilters() {
  const filters = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    if (filters.search === "") {
      setDebouncedSearch("");

      return undefined;
    }

    const timer = setTimeout(
      () => setDebouncedSearch(filters.search),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timer);
  }, [filters.search]);

  return {
    applied:
      debouncedSearch === filters.search
        ? filters
        : { ...filters, search: debouncedSearch },
    clearAll: () => emit(EMPTY_FILTERS),
    filters,
    removeGroup: (group: FilterGroup) => emit(clearGroup(current, group)),
    replace: (next: TransactionFilters) => emit(next),
    setSearch: (search: string) => emit({ ...current, search }),
  };
}

export { resetOverviewFilters };
export default useOverviewFilters;
