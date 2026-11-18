import BusinessError from "@domain/entities/errors/common/BusinessError";

// A location with items cannot be deleted (409). `itemCount` is the number of items using it.
class StockLocationInUse extends BusinessError {
  itemCount: number;

  constructor(itemCount: number) {
    super();
    this.name = "StockLocationInUse";
    this.itemCount = itemCount;
  }
}

export default StockLocationInUse;
