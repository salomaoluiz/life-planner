import BusinessError from "@domain/entities/errors/common/BusinessError";

// The amount in is needed to pay a transfer between currencies (422 TRANSFER_AMOUNT_IN_REQUIRED) (spec 098).
class TransferAmountInRequired extends BusinessError {
  constructor() {
    super();
    this.name = "TransferAmountInRequired";
  }
}

export default TransferAmountInRequired;
