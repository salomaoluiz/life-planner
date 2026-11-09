import BusinessError from "@domain/entities/errors/common/BusinessError";

// Origin and destination are the same account (422 TRANSFER_SAME_ACCOUNT) (spec 098).
class TransferSameAccount extends BusinessError {
  constructor() {
    super();
    this.name = "TransferSameAccount";
  }
}

export default TransferSameAccount;
