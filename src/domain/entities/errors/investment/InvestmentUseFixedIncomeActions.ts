import BusinessError from "@domain/entities/errors/common/BusinessError";

// Use the fixed income actions for this title (422): the generic operation or valuation routes refuse a calculated title.
class InvestmentUseFixedIncomeActions extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentUseFixedIncomeActions";
  }
}

export default InvestmentUseFixedIncomeActions;
