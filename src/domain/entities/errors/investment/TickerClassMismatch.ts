import BusinessError from "@domain/entities/errors/common/BusinessError";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";

// Spec 111: the ticker is a stock (or a FII) on B3 and was saved under the other class.
class TickerClassMismatch extends BusinessError {
  expectedClass: InvestmentAssetClass;

  constructor(expectedClass: InvestmentAssetClass) {
    super();
    this.name = "TickerClassMismatch";
    this.expectedClass = expectedClass;
  }
}

export default TickerClassMismatch;
