import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 107 FR 29: a suggestion cannot be approved as it is (422 INCOME_INCOMPLETE); `missing` names the fields.
class InvestmentIncomeIncomplete extends BusinessError {
  missing: string[];

  constructor(missing: string[]) {
    super();
    this.name = "InvestmentIncomeIncomplete";
    this.missing = missing;
  }
}

export default InvestmentIncomeIncomplete;
