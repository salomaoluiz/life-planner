import { useSyncExternalStore } from "react";

import { ALL_FILTER } from "../models/ownerFilter";

// Session-only selection (not persisted): module state outlives the Home screen.
let selection = ALL_FILTER;
const listeners = new Set<() => void>();

function getSelection() {
  return selection;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function resetHomeOwnerFilter() {
  selection = ALL_FILTER;
  notify();
}

function setSelection(value: string) {
  if (value === selection) {
    return;
  }

  selection = value;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function useHomeOwnerFilter(): [string, (value: string) => void] {
  const value = useSyncExternalStore(subscribe, getSelection, getSelection);

  return [value, setSelection];
}

export { resetHomeOwnerFilter, useHomeOwnerFilter };
