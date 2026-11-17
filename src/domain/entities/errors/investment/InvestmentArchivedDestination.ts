import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 112 FR 6: an archived destination can't receive a conversion (422).
class InvestmentArchivedDestination extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentArchivedDestination";
  }
}

export default InvestmentArchivedDestination;
