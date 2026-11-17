import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 112 FR 5: the origin has operations after the record date (`dates` are `YYYY-MM-DD`, oldest first).
class InvestmentConversionLaterOperations extends BusinessError {
  date: string;
  dates: string[];
  ticker: string;

  constructor(ticker: string, date: string, dates: string[]) {
    super();
    this.name = "InvestmentConversionLaterOperations";
    this.ticker = ticker;
    this.date = date;
    this.dates = dates;
  }
}

export default InvestmentConversionLaterOperations;
