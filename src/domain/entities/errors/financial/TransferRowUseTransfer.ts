import BusinessError from "@domain/entities/errors/common/BusinessError";

// A transfer row changes only through the transfer (422 TRANSFER_ROW_USE_TRANSFER) (spec 098).
class TransferRowUseTransfer extends BusinessError {
  constructor() {
    super();
    this.name = "TransferRowUseTransfer";
  }
}

export default TransferRowUseTransfer;
