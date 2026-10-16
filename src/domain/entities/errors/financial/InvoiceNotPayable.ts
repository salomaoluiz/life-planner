import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 409/422 when an invoice is already paid, still open, or changed under the payment.
class InvoiceNotPayable extends BusinessError {
  constructor() {
    super();
    this.name = "InvoiceNotPayable";
  }
}

export default InvoiceNotPayable;
