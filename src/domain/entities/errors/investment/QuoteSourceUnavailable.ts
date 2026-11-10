import BusinessError from "@domain/entities/errors/common/BusinessError";

// The quote source is down or has no token (503 QUOTE_SOURCE_UNAVAILABLE, spec 104).
class QuoteSourceUnavailable extends BusinessError {
  constructor() {
    super();
    this.name = "QuoteSourceUnavailable";
  }
}

export default QuoteSourceUnavailable;
