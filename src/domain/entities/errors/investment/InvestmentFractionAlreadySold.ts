import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 108 FR 15: the event's fraction already has its sale (409 FRACTION_ALREADY_SOLD).
class InvestmentFractionAlreadySold extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentFractionAlreadySold";
  }
}

export default InvestmentFractionAlreadySold;
