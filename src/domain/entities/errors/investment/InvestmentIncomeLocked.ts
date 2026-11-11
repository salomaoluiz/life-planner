import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 107 FR 16: the finance row belongs to an investment income (422 EXTERNALLY_LOCKED).
class InvestmentIncomeLocked extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentIncomeLocked";
  }
}

export default InvestmentIncomeLocked;
