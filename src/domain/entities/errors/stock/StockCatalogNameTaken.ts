import BusinessError from "@domain/entities/errors/common/BusinessError";

// A category or location with that name already exists among its siblings (409, spec 125).
class StockCatalogNameTaken extends BusinessError {
  constructor() {
    super();
    this.name = "StockCatalogNameTaken";
  }
}

export default StockCatalogNameTaken;
