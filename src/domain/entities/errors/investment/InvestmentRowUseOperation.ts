import BusinessError from "@domain/entities/errors/common/BusinessError";

// A finance row of an investment operation changes only through the operation (422).
class InvestmentRowUseOperation extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentRowUseOperation";
  }
}

export default InvestmentRowUseOperation;
