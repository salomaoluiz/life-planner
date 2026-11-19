import {
  BusinessError,
  SplitAdjustmentDuplicate,
  SplitCardExpenseOnly,
  SplitPartValueInvalid,
  SplitRowUseSplit,
  SplitSourceNotAllowed,
  SplitTooFewParts,
  SplitTooManyParts,
  SplitTotalMismatch,
  SplitTotalZero,
} from "@domain/entities/errors";

import unprocessableError from "./transactions/unprocessableError";

// Spec 119 section 7: the API answers the code of the rule in the message; the rest are the usual transaction 422s.
function splitUnprocessableError(message: string): BusinessError {
  if (message.includes("SPLIT_TOO_FEW_PARTS")) {
    return new SplitTooFewParts();
  }

  if (message.includes("SPLIT_TOO_MANY_PARTS")) {
    return new SplitTooManyParts();
  }

  if (message.includes("SPLIT_CARD_EXPENSE_ONLY")) {
    return new SplitCardExpenseOnly();
  }

  if (message.includes("SPLIT_PART_VALUE_INVALID")) {
    return new SplitPartValueInvalid();
  }

  if (message.includes("SPLIT_ADJUSTMENT_DUPLICATE")) {
    return new SplitAdjustmentDuplicate();
  }

  if (message.includes("SPLIT_TOTAL_ZERO")) {
    return new SplitTotalZero();
  }

  if (message.includes("SPLIT_TOTAL_MISMATCH")) {
    return new SplitTotalMismatch();
  }

  if (message.includes("SPLIT_SOURCE_NOT_ALLOWED")) {
    return new SplitSourceNotAllowed();
  }

  if (message.includes("SPLIT_ROW_USE_SPLIT")) {
    return new SplitRowUseSplit();
  }

  return unprocessableError(message);
}

export default splitUnprocessableError;
