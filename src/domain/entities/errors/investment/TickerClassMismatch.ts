import BusinessError from "@domain/entities/errors/common/BusinessError";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";

// The ticker belongs to another B3 class (422 TICKER_CLASS_MISMATCH, spec 111); `null` when the answer did not name
// it, so no plausible-but-wrong class is shown.
class TickerClassMismatch extends BusinessError {
  expectedClass: InvestmentAssetClass | null;

  constructor(expectedClass: InvestmentAssetClass | null) {
    super();
    this.expectedClass = expectedClass;
    this.name = "TickerClassMismatch";
  }
}

export default TickerClassMismatch;
