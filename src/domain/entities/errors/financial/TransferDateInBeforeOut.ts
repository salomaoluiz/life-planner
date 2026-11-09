import BusinessError from "@domain/entities/errors/common/BusinessError";

// The in date is before the out date (422 TRANSFER_DATE_IN_BEFORE_OUT) (spec 098).
class TransferDateInBeforeOut extends BusinessError {
  constructor() {
    super();
    this.name = "TransferDateInBeforeOut";
  }
}

export default TransferDateInBeforeOut;
