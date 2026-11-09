import BusinessError from "@domain/entities/errors/common/BusinessError";

// The fees of a sell are higher than the sale value (422).
class InvestmentFeesAboveSale extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentFeesAboveSale";
  }
}

export default InvestmentFeesAboveSale;
