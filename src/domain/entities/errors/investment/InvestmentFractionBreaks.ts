import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 108 FR 18: the change would remove the fraction a sale already sold (422, `date` of that sale).
class InvestmentFractionBreaks extends BusinessError {
  date: string;

  constructor(date: string) {
    super();
    this.name = "InvestmentFractionBreaks";
    this.date = date;
  }
}

export default InvestmentFractionBreaks;
