import BusinessError from "@domain/entities/errors/common/BusinessError";

// The code is not a valid barcode, for example a wrong GTIN check digit (400/422, spec 121 FR 1).
class StockBarcodeInvalid extends BusinessError {
  constructor() {
    super();
    this.name = "StockBarcodeInvalid";
  }
}

export default StockBarcodeInvalid;
