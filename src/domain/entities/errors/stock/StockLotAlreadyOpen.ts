import BusinessError from "@domain/entities/errors/common/BusinessError";

// The lot is already open (409).
class StockLotAlreadyOpen extends BusinessError {
  constructor() {
    super();
    this.name = "StockLotAlreadyOpen";
  }
}

export default StockLotAlreadyOpen;
