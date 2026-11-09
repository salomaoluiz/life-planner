import {
  AccountArchived,
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
  TransferAccountArchived,
  TransferAmountInRequired,
  TransferAmountMismatch,
  TransferDateInBeforeOut,
  TransferRowUseTransfer,
  TransferSameAccount,
} from "@domain/entities/errors";

import unprocessableError from "./unprocessableError";

it.each([
  ["Invoice is paid", InvoiceIsPaid],
  ["An installment is in a paid invoice", InstallmentPaid],
  ["Credit card is archived", CreditCardArchived],
  ["Account is archived", AccountArchived],
  ["Undo the prepayment first", PrepaymentBlocksEdit],
  ["Delete its refunds first", HasRefunds],
  ["Refunds can't exceed the purchase value", RefundOverPurchase],
  ["The value can't exceed what is left to pay", OverAmountDue],
  ["Occurrences after the new end date are paid", RecurrencePaidAfterEnd],
  ["An occurrence is paid", RecurrenceFrequencyBlocked],
  ["An occurrence is in a paid invoice", InvoiceIsPaid],
  ["Invoice is not available for this date", InvoiceNotAvailable],
  ["Recurring transactions follow the date", RecurringFollowsDate],
  ["TRANSFER_SAME_ACCOUNT", TransferSameAccount],
  ["TRANSFER_ACCOUNT_ARCHIVED", TransferAccountArchived],
  ["TRANSFER_AMOUNT_MISMATCH", TransferAmountMismatch],
  ["TRANSFER_AMOUNT_IN_REQUIRED", TransferAmountInRequired],
  ["TRANSFER_DATE_IN_BEFORE_OUT", TransferDateInBeforeOut],
  ["TRANSFER_ROW_USE_TRANSFER", TransferRowUseTransfer],
  ["anything else", AccountArchived],
])("SHOULD map the 422 message %s", (message, expected) => {
  expect(unprocessableError(message)).toBeInstanceOf(expected);
});
