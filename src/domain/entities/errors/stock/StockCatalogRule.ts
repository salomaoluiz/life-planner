import BusinessError from "@domain/entities/errors/common/BusinessError";

// A catalog write the API refused with 422 (depth, archived parent, unknown icon, invalid move target; spec 125).
// `reason` is the API code when it sends one.
class StockCatalogRule extends BusinessError {
  reason?: string;

  constructor(code?: string) {
    super();
    this.name = "StockCatalogRule";
    this.reason = code;
  }
}

export default StockCatalogRule;
