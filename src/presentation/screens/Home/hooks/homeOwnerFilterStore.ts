import { useSyncExternalStore } from "react";

import { setTag } from "@infrastructure/monitoring";

import { ALL_FILTER, PERSONAL_FILTER } from "../models/ownerFilter";

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
  tagOwner(selection);
  notify();
}

function setSelection(value: string) {
  if (value === selection) {
    return;
  }

  selection = value;
  tagOwner(value);
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

// Spec 106: events carry the owner in view: USER (personal), FAMILY (+ its id) or ALL.
function tagOwner(value: string) {
  const ownerTypes: Record<string, string> = {
    [ALL_FILTER]: "ALL",
    [PERSONAL_FILTER]: "USER",
  };
  const ownerType = ownerTypes[value];

  setTag("owner_type", ownerType ?? "FAMILY");
  setTag("family_id", ownerType ? undefined : value);
}

function useHomeOwnerFilter(): [string, (value: string) => void] {
  const value = useSyncExternalStore(subscribe, getSelection, getSelection);

  return [value, setSelection];
}

export { resetHomeOwnerFilter, useHomeOwnerFilter };
