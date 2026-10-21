import { useEffect, useState, useSyncExternalStore } from "react";

import {
  clearGroup,
  EMPTY_FILTERS,
  FilterGroup,
  TransactionFilters,
} from "../models/transactionFilters";

const SEARCH_DEBOUNCE_MS = 300;

// The filters live in memory for as long as the app is open (spec 045 FR 16): they survive leaving the
// screen (another Finances section, another tab, a modal) and are gone after a restart or a reload.
let current: TransactionFilters = EMPTY_FILTERS;
const listeners = new Set<() => void>();

function emit(next: TransactionFilters) {
  current = next;
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return current;
}

function resetTransactionFilters() {
  emit(EMPTY_FILTERS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function useTransactionFilters() {
  const filters = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // The queries follow the search 300 ms after the last keystroke; a cleared search applies at once.
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
    // What the queries use: the filters with the debounced search.
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

export { resetTransactionFilters };
export default useTransactionFilters;
