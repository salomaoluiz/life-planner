import BusinessError from "@domain/entities/errors/common/BusinessError";

// An account of the transfer is archived (422 TRANSFER_ACCOUNT_ARCHIVED) (spec 098).
class TransferAccountArchived extends BusinessError {
  constructor() {
    super();
    this.name = "TransferAccountArchived";
  }
}

export default TransferAccountArchived;
