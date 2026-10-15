import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a purchase is written into (or out of) an invoice that is already paid.
class InvoiceIsPaid extends BusinessError {
  constructor() {
    super();
    this.name = "InvoiceIsPaid";
  }
}

export default InvoiceIsPaid;
