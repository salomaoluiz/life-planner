import BusinessError from "@domain/entities/errors/common/BusinessError";

class FinancialNotFound extends BusinessError {
  constructor() {
    super();
    this.name = "FinancialNotFound";
  }
}

export default FinancialNotFound;
