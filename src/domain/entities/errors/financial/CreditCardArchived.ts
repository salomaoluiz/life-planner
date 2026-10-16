import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a purchase targets an archived credit card.
class CreditCardArchived extends BusinessError {
  constructor() {
    super();
    this.name = "CreditCardArchived";
  }
}

export default CreditCardArchived;
