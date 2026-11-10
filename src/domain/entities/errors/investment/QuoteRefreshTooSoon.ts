import BusinessError from "@domain/entities/errors/common/BusinessError";

// "Refresh now" was used less than a minute ago (429 REFRESH_TOO_SOON); `retryAfterSeconds` drives the countdown.
class QuoteRefreshTooSoon extends BusinessError {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super();
    this.name = "QuoteRefreshTooSoon";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export default QuoteRefreshTooSoon;
