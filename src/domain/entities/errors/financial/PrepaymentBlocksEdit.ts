import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a plan is edited structurally while it has a prepayment.
class PrepaymentBlocksEdit extends BusinessError {
  constructor() {
    super();
    this.name = "PrepaymentBlocksEdit";
  }
}

export default PrepaymentBlocksEdit;
