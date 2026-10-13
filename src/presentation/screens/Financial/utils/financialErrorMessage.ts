import {
  AccountHasTransactions,
  CategoryHasTransactions,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
} from "@domain/entities/errors";
import { TranslationKeys } from "@presentation/i18n/types";

// 006 business errors show their copy as a form-level error (or inside the ConfirmDialog);
// anything else is the generic message.
function getFinancialErrorMessageKey(
  error: unknown,
): TranslationKeys | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof AccountHasTransactions) {
    return "financial.accounts.errors.hasTransactions";
  }

  if (error instanceof CategoryHasTransactions) {
    return "financial.categories.errors.hasTransactions";
  }

  if (error instanceof FinancialNotFound) {
    return "financial.errors.notFound";
  }

  if (error instanceof FinancialOwnerNotAllowed) {
    return "financial.errors.ownerNotAllowed";
  }

  return "common.errors.generic";
}

export { getFinancialErrorMessageKey };
