import { numberLocale } from "@components/AmountText/formatAmount";
import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
  TAX_EXEMPT_PRODUCTS,
} from "@domain/entities/investment/enums";
import {
  InvestmentFixedIncome,
  InvestmentFixedIncomeRate,
} from "@domain/entities/investment/InvestmentEntities";
import { FixedIncomeRateParams } from "@domain/repositories/investment";
import { TranslationKeys } from "@presentation/i18n/types";
import { parseDecimal, ZERO } from "@utils/decimal";

// List chips (spec 105 FR 33): the maturity and the liquidity; the grace period uses the warning tone.
interface FixedIncomeChip {
  key: TranslationKeys;
  params: Record<string, string>;
  tone: "default" | "income" | "warning";
}

// The warning of a redemption date (FR 23): only AT_MATURITY before maturity and GRACE_PERIOD before its date.
type LiquidityWarning = "AT_MATURITY" | "GRACE_PERIOD";

// What the owner types, as text; the datasource normalizes "14,90" -> "14.9" before the call.
interface RateFormState {
  annualRate: string;
  cdiPercent: string;
  indexRate: string;
  mode: InvestmentFixedIncomeRateMode;
  spread: string;
}

function chipsOf(
  fixedIncome: InvestmentFixedIncome,
  formatDate: (day: string) => string,
): FixedIncomeChip[] {
  const chips: FixedIncomeChip[] = [
    {
      key: "investment.fixedIncome.chipMaturity",
      params: { date: formatDate(fixedIncome.maturityDate) },
      tone: "default",
    },
  ];

  switch (fixedIncome.liquidity) {
    case InvestmentFixedIncomeLiquidity.AT_MATURITY:
      chips.push({
        key: "investment.fixedIncome.liquidity.AT_MATURITY",
        params: {},
        tone: "default",
      });
      break;
    case InvestmentFixedIncomeLiquidity.DAILY:
      chips.push({
        key: "investment.fixedIncome.liquidity.DAILY",
        params: {},
        tone: "income",
      });
      break;
    case InvestmentFixedIncomeLiquidity.GRACE_PERIOD:
      chips.push({
        key: "investment.fixedIncome.chipGrace",
        params: { date: formatDate(fixedIncome.liquidityDate ?? "") },
        tone: "warning",
      });
      break;
  }

  return chips;
}

// Spec 105 FR 2: the switch is pre-filled by the product; the owner can change it.
function defaultTaxExempt(product: InvestmentFixedIncomeProduct): boolean {
  return TAX_EXEMPT_PRODUCTS.includes(product);
}

function emptyRateForm(
  mode: InvestmentFixedIncomeRateMode = InvestmentFixedIncomeRateMode.CDI_PERCENT,
): RateFormState {
  return { annualRate: "", cdiPercent: "", indexRate: "", mode, spread: "" };
}

// "0.225" -> "22,5": the rate of a lot as a percentage.
function fractionToPercent(fraction: string, localeTag: string): string {
  return new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 2,
  }).format(Number(fraction) * 100);
}

function isPositive(value: string): boolean {
  const parsed = parseDecimal(value);

  return parsed !== null && parsed > ZERO;
}

function isRateFormValid(form: RateFormState): boolean {
  return rateFieldsOf(form.mode).every((field) => isPositive(form[field]));
}

// The latest entry is the one the "Update rate" form pre-fills from.
function latestRate(
  fixedIncome: InvestmentFixedIncome,
): InvestmentFixedIncomeRate | undefined {
  return [...fixedIncome.rates].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  )[0];
}

function liquidityWarningOf(
  fixedIncome: InvestmentFixedIncome,
  date: string,
): LiquidityWarning | null {
  if (
    fixedIncome.liquidity === InvestmentFixedIncomeLiquidity.AT_MATURITY &&
    date < fixedIncome.maturityDate
  ) {
    return "AT_MATURITY";
  }
  if (
    fixedIncome.liquidity === InvestmentFixedIncomeLiquidity.GRACE_PERIOD &&
    fixedIncome.liquidityDate &&
    date < fixedIncome.liquidityDate
  ) {
    return "GRACE_PERIOD";
  }

  return null;
}

// The IR/IOF text of a lot row: "293 days · IR 20%", "15 days · IR 22.5% · IOF 50%".
function lotTaxesKey(taxExempt: boolean, iofRate: string): TranslationKeys {
  const hasIof = Number(iofRate) > 0;

  if (taxExempt) {
    return hasIof
      ? "investment.fixedIncome.lotTaxesExemptIof"
      : "investment.fixedIncome.lotTaxesExempt";
  }

  return hasIof
    ? "investment.fixedIncome.lotTaxesIof"
    : "investment.fixedIncome.lotTaxes";
}

// "16.510000" -> "16,51" (pt-BR) / "16.51" (en-US): at most 2 places, no trailing zeros.
function percentText(value: null | string, localeTag: string): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

// The effective rate (% per year) the form shows while typing; the API derives and stores the real one (FR 7).
function previewEffectiveRate(form: RateFormState): null | number {
  if (!isRateFormValid(form)) {
    return null;
  }

  function number(value: string): number {
    return Number(parseDecimal(value) ?? ZERO) / 1e8;
  }

  switch (form.mode) {
    case InvestmentFixedIncomeRateMode.CDI_PERCENT: {
      const daily = Math.pow(1 + number(form.indexRate) / 100, 1 / 252) - 1;

      return (
        (Math.pow(1 + (daily * number(form.cdiPercent)) / 100, 252) - 1) * 100
      );
    }
    case InvestmentFixedIncomeRateMode.IPCA_PLUS:
      return (
        ((1 + number(form.indexRate) / 100) * (1 + number(form.spread) / 100) -
          1) *
        100
      );
    case InvestmentFixedIncomeRateMode.PREFIXED:
      return number(form.annualRate);
  }
}

// The entry of the history tab: the typed rate and what it became.
function rateEntry(
  rate: InvestmentFixedIncomeRate,
  localeTag: string,
): { key: TranslationKeys; params: Record<string, string> } {
  const effective = percentText(rate.effectiveRate, localeTag);
  function pct(value: null | string): string {
    return percentText(value, localeTag);
  }

  switch (rate.mode) {
    case InvestmentFixedIncomeRateMode.CDI_PERCENT:
      return {
        key: "investment.fixedIncome.rateEntryCdi",
        params: {
          effective,
          index: pct(rate.indexRate),
          percent: pct(rate.cdiPercent),
        },
      };
    case InvestmentFixedIncomeRateMode.IPCA_PLUS:
      return {
        key: "investment.fixedIncome.rateEntryIpca",
        params: {
          effective,
          index: pct(rate.indexRate),
          spread: pct(rate.spread),
        },
      };
    case InvestmentFixedIncomeRateMode.PREFIXED:
      return {
        key: "investment.fixedIncome.rateEntryPrefixed",
        params: { effective, rate: pct(rate.annualRate) },
      };
  }
}

// Which fields the mode needs, in the order they are shown.
function rateFieldsOf(
  mode: InvestmentFixedIncomeRateMode,
): (keyof Omit<RateFormState, "mode">)[] {
  switch (mode) {
    case InvestmentFixedIncomeRateMode.CDI_PERCENT:
      return ["cdiPercent", "indexRate"];
    case InvestmentFixedIncomeRateMode.IPCA_PLUS:
      return ["spread", "indexRate"];
    case InvestmentFixedIncomeRateMode.PREFIXED:
      return ["annualRate"];
  }
}

// The update form pre-fills the mode and the percent of the latest entry (spec 105 FR 9).
function rateFormFrom(rate: InvestmentFixedIncomeRate): RateFormState {
  return {
    annualRate: rate.annualRate ?? "",
    cdiPercent: rate.cdiPercent ?? "",
    indexRate: rate.indexRate ?? "",
    mode: rate.mode,
    spread: rate.spread ?? "",
  };
}

// "110% do CDI (CDI 14,90%)", "IPCA 4,5% + 6,2%", "13,5% a.a. prefixado".
function rateSummary(
  rate: Pick<
    InvestmentFixedIncomeRate,
    "annualRate" | "cdiPercent" | "indexRate" | "mode" | "spread"
  >,
  localeTag: string,
): { key: TranslationKeys; params: Record<string, string> } {
  function pct(value: null | string): string {
    return percentText(value, localeTag);
  }

  switch (rate.mode) {
    case InvestmentFixedIncomeRateMode.CDI_PERCENT:
      return {
        key: "investment.fixedIncome.rateLineCdi",
        params: { index: pct(rate.indexRate), percent: pct(rate.cdiPercent) },
      };
    case InvestmentFixedIncomeRateMode.IPCA_PLUS:
      return {
        key: "investment.fixedIncome.rateLineIpca",
        params: { index: pct(rate.indexRate), spread: pct(rate.spread) },
      };
    case InvestmentFixedIncomeRateMode.PREFIXED:
      return {
        key: "investment.fixedIncome.rateLinePrefixed",
        params: { rate: pct(rate.annualRate) },
      };
  }
}

function toRateParams(
  form: RateFormState,
  startDate?: string,
): FixedIncomeRateParams {
  return {
    annualRate: form.annualRate,
    cdiPercent: form.cdiPercent,
    indexRate: form.indexRate,
    mode: form.mode,
    spread: form.spread,
    startDate,
  };
}

export type { FixedIncomeChip, LiquidityWarning, RateFormState };
export {
  chipsOf,
  defaultTaxExempt,
  emptyRateForm,
  fractionToPercent,
  isRateFormValid,
  latestRate,
  liquidityWarningOf,
  lotTaxesKey,
  percentText,
  previewEffectiveRate,
  rateEntry,
  rateFieldsOf,
  rateFormFrom,
  rateSummary,
  toRateParams,
};
