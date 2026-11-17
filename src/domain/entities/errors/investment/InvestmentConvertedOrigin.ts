import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 112 FR 21: an origin stays archived while its conversion exists (`ticker` of the destination).
class InvestmentConvertedOrigin extends BusinessError {
  ticker: string;

  constructor(ticker: string) {
    super();
    this.name = "InvestmentConvertedOrigin";
    this.ticker = ticker;
  }
}

export default InvestmentConvertedOrigin;
