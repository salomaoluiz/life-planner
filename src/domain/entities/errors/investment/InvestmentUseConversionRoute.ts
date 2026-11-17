import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 112: a conversion operation changes only through its conversion (422 USE_CONVERSION_ROUTE).
class InvestmentUseConversionRoute extends BusinessError {
  constructor() {
    super();
    this.name = "InvestmentUseConversionRoute";
  }
}

export default InvestmentUseConversionRoute;
