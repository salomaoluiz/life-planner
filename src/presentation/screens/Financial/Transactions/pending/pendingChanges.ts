import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { RecurrenceScope } from "@domain/entities/financial/RecurrenceEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import type { TransactionFormState } from "@screens/Financial/Transactions/modals/NewTransactionModal/models/transactionFormState";

interface PendingChange {
  description: string;
  id: string;
  kind: PendingKind;
  // Create/edit: the values being saved. The create row carries the temporary id.
  previous?: TransactionDTO;
  // The id the API gave a created row; the list then ignores the temporary row (the refetch may land first).
  resolvedId?: string;
  row?: TransactionDTO;
  target?: PendingTarget;
}

interface PendingFailure {
  description: string;
  id: string;
  kind: PendingKind;
  // The copy of a business error (e.g. paid invoice); none for a generic failure.
  messageKey?: TranslationKeys;
  retry: () => void;
}

// Spec 061: changes the user confirmed whose request is still running. They live outside any screen, so the modal
// can close (and unmount) while the request goes on; the transactions list merges them into what it shows.
type PendingKind = "create" | "delete" | "edit";

interface PendingTarget {
  // Recurrence delete: every row of the series from this occurrence on (ALL: the whole series).
  fromOccurrence?: number;
  recurrenceId?: string;
  scope?: RecurrenceScope;
  transactionId?: string;
}

// "Try again" of a failed create/edit reopens the form with what the user had typed (spec 061 FR 9).
let retryDraft: TransactionFormState | undefined;

function consumeRetryDraft() {
  const draft = retryDraft;

  retryDraft = undefined;

  return draft;
}

function setRetryDraft(draft: TransactionFormState) {
  retryDraft = draft;
}

let changes: readonly PendingChange[] = [];
let failures: readonly PendingFailure[] = [];
let sequence = 0;
const listeners = new Set<() => void>();

function addChange(change: PendingChange) {
  changes = [...changes, change];
  emit();
}

function addFailure(failure: PendingFailure) {
  failures = [...failures, failure];
  emit();
}

function emit() {
  listeners.forEach((listener) => listener());
}

function getChanges() {
  return changes;
}

function getFailures() {
  return failures;
}

function hasPendingChanges(list: readonly PendingChange[]) {
  return list.length > 0;
}

function newPendingId() {
  sequence += 1;

  return `pending-${Date.now().toString(36)}-${sequence}-${Math.random().toString(36).slice(2, 8)}`;
}

function removeChange(id: string) {
  changes = changes.filter((change) => change.id !== id);
  emit();
}

function resetPending() {
  changes = [];
  failures = [];
  emit();
}

function resolveChange(id: string, resolvedId: string) {
  changes = changes.map((change) =>
    change.id === id ? { ...change, resolvedId } : change,
  );
  emit();
}

function shiftFailure() {
  failures = failures.slice(1);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export type { PendingChange, PendingFailure, PendingKind, PendingTarget };
export {
  addChange,
  addFailure,
  consumeRetryDraft,
  getChanges,
  getFailures,
  hasPendingChanges,
  newPendingId,
  removeChange,
  resetPending,
  resolveChange,
  setRetryDraft,
  shiftFailure,
  subscribe,
};
