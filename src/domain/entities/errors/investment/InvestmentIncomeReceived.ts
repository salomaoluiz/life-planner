import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 107 FR 12: the income was already confirmed (409 ALREADY_RECEIVED).
class InvestmentIncomeReceived extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentIncomeReceived";
  }
}

export default InvestmentIncomeReceived;
