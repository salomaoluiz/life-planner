import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when an early payment is bigger than what is left to pay.
class OverAmountDue extends BusinessError {
  constructor() {
    super();
    this.name = "OverAmountDue";
  }
}

export default OverAmountDue;
