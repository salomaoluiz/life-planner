import BusinessError from "@domain/entities/errors/common/BusinessError";

// The owner already has an asset with this ticker (409).
class TickerExists extends BusinessError {
  constructor() {
    super();
    this.name = "TickerExists";
  }
}

export default TickerExists;
