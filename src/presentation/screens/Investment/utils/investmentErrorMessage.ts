import {
  FamilyArchived,
  InvestmentAccountNotChangeable,
  InvestmentArchived,
  InvestmentClassLocked,
  InvestmentFeesAboveSale,
  InvestmentNegativePosition,
  QuoteRefreshTooSoon,
  QuoteSourceUnavailable,
  TickerExists,
  TickerNotFound,
} from "@domain/entities/errors";
import { TranslationKeys } from "@presentation/i18n/types";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

export interface InvestmentErrorMessage {
  key: TranslationKeys;
  params?: Record<string, string>;
}

// The copy of an investment write failure (spec 102); a financial error falls back to its own message,
// anything else is the generic one. `undefined` means no error.
function getInvestmentErrorMessage(
  error: unknown,
  formatDate: (day: string) => string = (day) => day,
): InvestmentErrorMessage | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof InvestmentNegativePosition) {
    return {
      key: "investment.errors.negativePosition",
      params: { date: formatDate(error.date) },
    };
  }

  const direct: [new (...args: never[]) => unknown, TranslationKeys][] = [
    [InvestmentAccountNotChangeable, "investment.errors.accountNotChangeable"],
    [InvestmentArchived, "investment.errors.archived"],
    [InvestmentClassLocked, "investment.errors.classLocked"],
    [InvestmentFeesAboveSale, "investment.errors.feesAboveSale"],
    [QuoteRefreshTooSoon, "investment.errors.refreshTooSoon"],
    [QuoteSourceUnavailable, "investment.errors.sourceUnavailable"],
    [TickerExists, "investment.errors.tickerExists"],
    [TickerNotFound, "investment.errors.tickerNotFound"],
    [FamilyArchived, "family.errors.archived"],
  ];
  const match = direct.find(([errorClass]) => error instanceof errorClass);

  if (match) {
    return { key: match[1] };
  }

  return {
    key: getFinancialErrorMessageKey(error) ?? "investment.errors.generic",
  };
}

export default getInvestmentErrorMessage;
