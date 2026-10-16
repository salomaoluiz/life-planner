import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a plan change touches an installment that is already in a paid invoice.
class InstallmentPaid extends BusinessError {
  constructor() {
    super();
    this.name = "InstallmentPaid";
  }
}

export default InstallmentPaid;
