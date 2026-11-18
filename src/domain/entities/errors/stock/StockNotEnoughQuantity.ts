import BusinessError from "@domain/entities/errors/common/BusinessError";

// There is not enough quantity in the lots (409).
class StockNotEnoughQuantity extends BusinessError {
  constructor() {
    super();
    this.name = "StockNotEnoughQuantity";
  }
}

export default StockNotEnoughQuantity;
