import BusinessError from "@domain/entities/errors/common/BusinessError";

class AccountHasTransactions extends BusinessError {
  constructor() {
    super();
    this.name = "AccountHasTransactions";
  }
}

export default AccountHasTransactions;
