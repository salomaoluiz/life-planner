import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when the chosen invoice is not the previous, computed or next one of the date (spec 095).
class InvoiceNotAvailable extends BusinessError {
  constructor() {
    super();
    this.name = "InvoiceNotAvailable";
  }
}

export default InvoiceNotAvailable;
