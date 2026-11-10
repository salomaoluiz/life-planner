import BusinessError from "@domain/entities/errors/common/BusinessError";

// Class and currency cannot change after the first operation (422).
class InvestmentClassLocked extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentClassLocked";
  }
}

export default InvestmentClassLocked;
