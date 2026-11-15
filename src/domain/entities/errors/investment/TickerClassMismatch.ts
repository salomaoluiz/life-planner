import BusinessError from "@domain/entities/errors/common/BusinessError";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";

// The ticker belongs to another B3 class (422 TICKER_CLASS_MISMATCH, spec 111).
class TickerClassMismatch extends BusinessError {
  expectedClass: InvestmentAssetClass;

  constructor(expectedClass: InvestmentAssetClass) {
    super();
    this.expectedClass = expectedClass;
    this.name = "TickerClassMismatch";
  }
}

export default TickerClassMismatch;
