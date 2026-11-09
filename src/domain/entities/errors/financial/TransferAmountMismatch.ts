import BusinessError from "@domain/entities/errors/common/BusinessError";

// The same currency needs equal amounts (422 TRANSFER_AMOUNT_MISMATCH) (spec 098).
class TransferAmountMismatch extends BusinessError {
  constructor() {
    super();
    this.name = "TransferAmountMismatch";
  }
}

export default TransferAmountMismatch;
