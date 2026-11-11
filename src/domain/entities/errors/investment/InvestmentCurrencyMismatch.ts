import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 107 FR 3: the account currency differs from the asset currency (422 CURRENCY_MISMATCH).
class InvestmentCurrencyMismatch extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentCurrencyMismatch";
  }
}

export default InvestmentCurrencyMismatch;
