import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 108 FR 13: an event dated where no shares are held (422, `date` is `YYYY-MM-DD`).
class InvestmentNoPosition extends BusinessError {
  date: string;

  constructor(date: string) {
    super();
    this.name = "InvestmentNoPosition";
    this.date = date;
  }
}

export default InvestmentNoPosition;
