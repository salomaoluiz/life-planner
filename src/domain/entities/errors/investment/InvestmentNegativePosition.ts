import BusinessError from "@domain/entities/errors/common/BusinessError";

// The change would make the position negative on `date` (`YYYY-MM-DD`, 422).
class InvestmentNegativePosition extends BusinessError {
  date: string;

  constructor(date: string) {
    super();
    this.name = "InvestmentNegativePosition";
    this.date = date;
  }
}

export default InvestmentNegativePosition;
