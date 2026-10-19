import {
  AccountArchived,
  CreditCardArchived,
  HasRefunds,
  InstallmentPaid,
  InvoiceIsPaid,
  OverAmountDue,
  PrepaymentBlocksEdit,
  RecurrenceFrequencyBlocked,
  RecurrencePaidAfterEnd,
  RefundOverPurchase,
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
  ["anything else", AccountArchived],
])("SHOULD map the 422 message %s", (message, expected) => {
  expect(unprocessableError(message)).toBeInstanceOf(expected);
});
