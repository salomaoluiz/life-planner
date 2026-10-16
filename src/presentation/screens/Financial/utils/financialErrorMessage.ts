import {
  AccountArchived,
  AccountHasTransactions,
  CategoryHasTransactions,
  CreditCardArchived,
  CreditCardHasTransactions,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  InvoiceIsPaid,
  InvoiceNotPayable,
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

  if (error instanceof AccountArchived) {
    return "financial.errors.accountArchived";
  }

  if (error instanceof CreditCardArchived) {
    return "financial.errors.cardArchived";
  }

  if (error instanceof InvoiceIsPaid) {
    return "financial.errors.invoicePaid";
  }

  if (error instanceof InvoiceNotPayable) {
    return "financial.errors.invoiceNotPayable";
  }

  if (error instanceof AccountHasTransactions) {
    return "financial.accounts.errors.hasTransactions";
  }

  if (error instanceof CategoryHasTransactions) {
    return "financial.categories.errors.hasTransactions";
  }

  if (error instanceof CreditCardHasTransactions) {
    return "financial.cards.delete.hasTransactions";
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
