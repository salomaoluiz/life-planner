import BusinessError from "@domain/entities/errors/common/BusinessError";

// Archived assets refuse operations and valuations (422).
class InvestmentArchived extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentArchived";
  }
}

export default InvestmentArchived;
