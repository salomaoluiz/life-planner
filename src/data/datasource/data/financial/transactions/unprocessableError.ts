import {
  AccountArchived,
  BusinessError,
  CreditCardArchived,
  HasRefunds,
  InstallmentPaid,
  InvoiceIsPaid,
  InvoiceNotAvailable,
  OverAmountDue,
  PrepaymentBlocksEdit,
  RecurrenceFrequencyBlocked,
  RecurrencePaidAfterEnd,
  RecurringFollowsDate,
  RefundOverPurchase,
} from "@domain/entities/errors";

// The API answers 422 for several reasons on a transaction or card-credit write; the message tells them apart.
function unprocessableError(message: string): BusinessError {
  if (message.includes("An installment is in a paid invoice")) {
    return new InstallmentPaid();
  }

  if (message.includes("Occurrences after the new end date are paid")) {
    return new RecurrencePaidAfterEnd();
  }

  if (message.includes("An occurrence is paid")) {
    return new RecurrenceFrequencyBlocked();
  }

  // A recurring card occurrence in a paid invoice (spec 034 FR 30).
  if (message.includes("An occurrence is in a paid invoice")) {
    return new InvoiceIsPaid();
  }

  if (message.includes("Invoice is paid")) {
    return new InvoiceIsPaid();
  }

  // Spec 095: the chosen invoice is not one of the three options of the date.
  if (message.includes("Invoice is not available for this date")) {
    return new InvoiceNotAvailable();
  }

  if (message.includes("Recurring transactions follow the date")) {
    return new RecurringFollowsDate();
  }

  if (message.includes("Credit card is archived")) {
    return new CreditCardArchived();
  }

  if (message.includes("Undo the prepayment first")) {
    return new PrepaymentBlocksEdit();
  }

  if (message.includes("Delete its refunds first")) {
    return new HasRefunds();
  }

  if (message.includes("Refunds can't exceed")) {
    return new RefundOverPurchase();
  }

  if (message.includes("can't exceed what is left to pay")) {
    return new OverAmountDue();
  }

  return new AccountArchived();
}

export default unprocessableError;
