import BusinessError from "@domain/entities/errors/common/BusinessError";

class FinancialOwnerNotAllowed extends BusinessError {
  constructor() {
    super();
    this.name = "FinancialOwnerNotAllowed";
  }
}

export default FinancialOwnerNotAllowed;
