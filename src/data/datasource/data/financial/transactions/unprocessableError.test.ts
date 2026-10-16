import {
  AccountArchived,
  CreditCardArchived,
  InstallmentPaid,
  InvoiceIsPaid,
} from "@domain/entities/errors";

import unprocessableError from "./unprocessableError";

it.each([
  ["Invoice is paid", InvoiceIsPaid],
  ["An installment is in a paid invoice", InstallmentPaid],
  ["Credit card is archived", CreditCardArchived],
  ["Account is archived", AccountArchived],
  ["anything else", AccountArchived],
])("SHOULD map the 422 message %s", (message, expected) => {
  expect(unprocessableError(message)).toBeInstanceOf(expected);
});
