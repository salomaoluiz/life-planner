import {
  ApiBusinessError,
  BusinessError,
  ConnectivityError,
  GenericError,
  StockNotEnoughQuantity,
  StockUndoTooLate,
} from "@domain/entities/errors";
import { TranslationKeys } from "@presentation/i18n/types";

export type QuickFailure =
  // No connection (or a server failure worth retrying): keep it queued.
  | { kind: "OFFLINE" }
  // Refused for good: the row goes back to the server value.
  | { kind: "REFUSED"; reasonKey: TranslationKeys };

// The statuses the API answers to a write it will never accept as it is (item gone, archived family, conflict).
const REFUSAL_STATUSES = [404, 409, 422];

// Spec 117 FR 22-23: connectivity keeps the entry, a refusal drops it, anything else (a 5xx) is retried later.
export function classifyFailure(error: unknown): QuickFailure {
  if (error instanceof ConnectivityError) {
    return { kind: "OFFLINE" };
  }

  if (error instanceof StockNotEnoughQuantity) {
    return { kind: "REFUSED", reasonKey: "stock.offline.reasonNotEnough" };
  }

  if (error instanceof StockUndoTooLate) {
    return { kind: "REFUSED", reasonKey: "stock.quick.undoTooLate" };
  }

  if (error instanceof GenericError) {
    const status = statusOf(error);

    if (status === 404) {
      return { kind: "REFUSED", reasonKey: "stock.offline.reasonGone" };
    }

    return status !== undefined && REFUSAL_STATUSES.includes(status)
      ? { kind: "REFUSED", reasonKey: "stock.offline.reasonRejected" }
      : { kind: "OFFLINE" };
  }

  return error instanceof BusinessError
    ? { kind: "REFUSED", reasonKey: "stock.offline.reasonRejected" }
    : { kind: "OFFLINE" };
}

function statusOf(error: GenericError): number | undefined {
  const cause = error.context.error;

  return cause instanceof ApiBusinessError ? cause.statusCode : undefined;
}
