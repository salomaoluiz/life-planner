import BusinessError from "@domain/entities/errors/common/BusinessError";

class CreditCardHasTransactions extends BusinessError {
  constructor() {
    super();
    this.name = "CreditCardHasTransactions";
  }
}

export default CreditCardHasTransactions;
