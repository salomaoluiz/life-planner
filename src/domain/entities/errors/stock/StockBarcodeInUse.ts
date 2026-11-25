import BusinessError from "@domain/entities/errors/common/BusinessError";

// Another item of the same owner already has this code (409, spec 121 FR 2).
class StockBarcodeInUse extends BusinessError {
  description: string;
  itemId: string;

  constructor(itemId: string, description: string) {
    super();
    this.name = "StockBarcodeInUse";
    this.itemId = itemId;
    this.description = description;
  }
}

export default StockBarcodeInUse;
