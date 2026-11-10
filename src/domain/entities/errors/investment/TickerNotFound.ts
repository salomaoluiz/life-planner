import BusinessError from "@domain/entities/errors/common/BusinessError";

// The market source does not know the ticker (422 TICKER_NOT_FOUND, spec 104).
class TickerNotFound extends BusinessError {
  constructor() {
    super();
    this.name = "TickerNotFound";
  }
}

export default TickerNotFound;
