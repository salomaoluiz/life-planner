import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 115 FR 12: the first occurrence has no position at its ex-date (422 NO_POSITION_AT_START).
class InvestmentNoPositionAtStart extends BusinessError {
  firstBuyDate: null | string;

  constructor(firstBuyDate: null | string) {
    super();
    this.name = "InvestmentNoPositionAtStart";
    this.firstBuyDate = firstBuyDate;
  }
}

export default InvestmentNoPositionAtStart;
