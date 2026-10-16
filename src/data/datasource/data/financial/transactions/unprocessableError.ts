import {
  AccountArchived,
  BusinessError,
  CreditCardArchived,
  InvoiceIsPaid,
} from "@domain/entities/errors";

// The API answers 422 for three reasons on a transaction write; the message tells them apart.
function unprocessableError(message: string): BusinessError {
  if (message.includes("Invoice is paid")) {
    return new InvoiceIsPaid();
  }

  if (message.includes("Credit card is archived")) {
    return new CreditCardArchived();
  }

  return new AccountArchived();
}

export default unprocessableError;
