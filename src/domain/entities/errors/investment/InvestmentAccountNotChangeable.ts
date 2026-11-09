import BusinessError from "@domain/entities/errors/common/BusinessError";

// The operation uses an account the caller cannot change (403).
class InvestmentAccountNotChangeable extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentAccountNotChangeable";
  }
}

export default InvestmentAccountNotChangeable;
