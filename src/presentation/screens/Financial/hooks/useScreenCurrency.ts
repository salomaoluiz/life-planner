import { useState } from "react";

import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
} from "@domain/entities/financial/Currency";

export type ScreenCurrency = ReturnType<typeof useScreenCurrency>;

interface CurrencyAccount {
  currency: CurrencyCode;
  status: string;
}

// Spec 103: the currencies of the ACTIVE accounts, BRL first. Money of different currencies is never summed, so a
// screen shows one currency at a time.
function activeCurrencies(accounts: CurrencyAccount[]): CurrencyCode[] {
  const present = new Set(
    accounts
      .filter((account) => account.status === "ACTIVE")
      .map((account) => account.currency),
  );

  return SUPPORTED_CURRENCIES.filter((code) => present.has(code));
}

// Spec 103 FR 14: the currency a screen shows. The choice lives in memory for the session (BRL on a fresh start); the
// dropdown only exists with more than one active currency, and a choice that no longer has an active account falls back
// to BRL.
function useScreenCurrency(accounts: CurrencyAccount[]) {
  const [choice, setChoice] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const options = activeCurrencies(accounts);
  const currency = options.includes(choice) ? choice : DEFAULT_CURRENCY;

  return {
    currency,
    options,
    setCurrency: setChoice,
    visible: options.length > 1,
  };
}
export { activeCurrencies };
export default useScreenCurrency;
