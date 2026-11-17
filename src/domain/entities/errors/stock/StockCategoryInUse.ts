import BusinessError from "@domain/entities/errors/common/BusinessError";

// A category with items cannot be deleted (409). `itemCount` is the number of items using it.
class StockCategoryInUse extends BusinessError {
  itemCount: number;

  constructor(itemCount: number) {
    super();
    this.name = "StockCategoryInUse";
    this.itemCount = itemCount;
  }
}

export default StockCategoryInUse;
