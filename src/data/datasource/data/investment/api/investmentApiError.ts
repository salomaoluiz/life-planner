import {
  AccountArchived,
  ApiBusinessError,
  BusinessError,
  FieldInvalid,
  InvestmentAccountNotChangeable,
  InvestmentArchived,
  InvestmentClassLocked,
  InvestmentCurrencyMismatch,
  InvestmentFeesAboveSale,
  InvestmentFractionAlreadySold,
  InvestmentFractionBreaks,
  InvestmentIncomeIncomplete,
  InvestmentIncomeLocked,
  InvestmentIncomeReceived,
  InvestmentNegativePosition,
  InvestmentNoPosition,
  InvestmentRedemptionTooLarge,
  InvestmentRowUseOperation,
  InvestmentUseFixedIncomeActions,
  QuoteRefreshTooSoon,
  QuoteSourceUnavailable,
  TickerExists,
  TickerNotFound,
} from "@domain/entities/errors";

import handleFinancialApiError from "../../financial/financialApiError";

const NEGATIVE_POSITION = /negative on (\d{4}-\d{2}-\d{2})/;
const NO_POSITION = /no position on (\d{4}-\d{2}-\d{2})/;
const FRACTION_BREAKS = /removes the fraction sold on (\d{4}-\d{2}-\d{2})/;

function handleInvestmentApiError(
  error: unknown,
  context: Record<string, unknown>,
  fields?: Record<string, unknown>,
): never {
  if (
    error instanceof ApiBusinessError &&
    error.statusCode === 403 &&
    error.message.includes("account you can't change")
  ) {
    throw new InvestmentAccountNotChangeable();
  }

  if (error instanceof ApiBusinessError) {
    const code = error.body?.code;

    if (error.statusCode === 429 && code === "REFRESH_TOO_SOON") {
      throw new QuoteRefreshTooSoon(Number(error.body.retryAfterSeconds ?? 60));
    }
    if (error.statusCode === 503 && code === "QUOTE_SOURCE_UNAVAILABLE") {
      throw new QuoteSourceUnavailable();
    }
    if (error.statusCode === 422 && code === "TICKER_NOT_FOUND") {
      throw new TickerNotFound();
    }
    // Spec 107: the income rules answer a code (section 7).
    if (error.statusCode === 422 && code === "CURRENCY_MISMATCH") {
      throw new InvestmentCurrencyMismatch();
    }
    if (error.statusCode === 422 && code === "EXTERNALLY_LOCKED") {
      throw new InvestmentIncomeLocked();
    }
    if (error.statusCode === 422 && code === "INCOME_INCOMPLETE") {
      throw new InvestmentIncomeIncomplete(
        Array.isArray(error.body.missing)
          ? (error.body.missing as string[])
          : [],
      );
    }
    if (error.statusCode === 409 && code === "ALREADY_RECEIVED") {
      throw new InvestmentIncomeReceived();
    }
    // Spec 108 section 7: a second sale of the same fraction.
    if (error.statusCode === 409 && code === "FRACTION_ALREADY_SOLD") {
      throw new InvestmentFractionAlreadySold();
    }
    // Spec 105 FR 20-21: the 422 carries `details` (availableNet of a redemption, or the date it stopped fitting).
    if (error.statusCode === 422 && error.body?.details) {
      const details = error.body.details as {
        availableNet?: number;
        date?: string;
      };

      if (
        typeof details.availableNet === "number" ||
        (typeof details.date === "string" &&
          String(error.message).includes("larger than the title"))
      ) {
        throw new InvestmentRedemptionTooLarge({
          availableNet: details.availableNet,
          date: details.date,
        });
      }
    }
  }

  return handleFinancialApiError(error, context, {
    conflict: () => new TickerExists(),
    fields,
    unprocessable: investmentUnprocessable,
  });
}

// The API answers the rule in the message (spec 102 section 7); an unknown 422 stays a generic error.
function investmentUnprocessable(message: string): BusinessError | undefined {
  const negative = NEGATIVE_POSITION.exec(message);

  if (negative) {
    return new InvestmentNegativePosition(negative[1]);
  }
  const noPosition = NO_POSITION.exec(message);

  if (noPosition) {
    return new InvestmentNoPosition(noPosition[1]);
  }

  const fractionBreaks = FRACTION_BREAKS.exec(message);

  if (fractionBreaks) {
    return new InvestmentFractionBreaks(fractionBreaks[1]);
  }
  if (message.includes("Class and currency can't change")) {
    return new InvestmentClassLocked();
  }
  if (message.includes("Archived assets can't change")) {
    return new InvestmentArchived();
  }
  if (message.includes("Fees are higher than the sale value")) {
    return new InvestmentFeesAboveSale();
  }
  if (message.includes("Use the fixed income actions")) {
    return new InvestmentUseFixedIncomeActions();
  }
  if (message.includes("Edit this transaction through its investment")) {
    return new InvestmentRowUseOperation();
  }
  if (message.includes("Account is archived")) {
    return new AccountArchived();
  }
  if (message.includes("Account currency differs")) {
    return new FieldInvalid({ accountId: message });
  }

  return undefined;
}

export default handleInvestmentApiError;
