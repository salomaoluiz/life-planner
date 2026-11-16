import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 112 FR 19: the destination was converted again; `ticker` and `date` name that later conversion's destination (422 CONVERSION_CHAIN_LOCKED).
class InvestmentConversionChainLocked extends BusinessError {
  date: string;
  ticker: string;

  constructor(ticker: string, date: string) {
    super();
    this.name = "InvestmentConversionChainLocked";
    this.ticker = ticker;
    this.date = date;
  }
}

export default InvestmentConversionChainLocked;
