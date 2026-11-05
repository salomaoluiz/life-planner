import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 409 when a confirm targets a row that is already effective (spec 096).
class TransactionNotProjected extends BusinessError {
  constructor() {
    super();
    this.name = "TransactionNotProjected";
  }
}

export default TransactionNotProjected;
