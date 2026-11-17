import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 115 FR 16: a series creates at most `max` occurrences at once (422 TOO_MANY_OCCURRENCES).
class InvestmentTooManyOccurrences extends BusinessError {
  count: number;
  max: number;

  constructor(count: number, max: number) {
    super();
    this.name = "InvestmentTooManyOccurrences";
    this.count = count;
    this.max = max;
  }
}

export default InvestmentTooManyOccurrences;
