import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when the refunds linked to a purchase would pass its value.
class RefundOverPurchase extends BusinessError {
  constructor() {
    super();
    this.name = "RefundOverPurchase";
  }
}

export default RefundOverPurchase;
