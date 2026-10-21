import { TypeFilter } from "../models/transactionList";

// Spec 046 FR 17: "see this category / tag" opens Transactions with the scope and type of the dashboard. The screen
// keeps both in local state, so the overview leaves them here and the screen takes them when it gains focus.
interface PendingNavigation {
  scope?: string;
  type?: TypeFilter;
}

let pending: PendingNavigation | undefined;

function consumePendingNavigation(): PendingNavigation | undefined {
  const value = pending;

  pending = undefined;

  return value;
}

function setPendingNavigation(next: PendingNavigation) {
  pending = next;
}

export { consumePendingNavigation, setPendingNavigation };
