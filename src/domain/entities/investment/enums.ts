// Spec 102: enum values are identical to the API's.
export enum InvestmentAssetClass {
  BR_REIT = "BR_REIT",
  BR_STOCK = "BR_STOCK",
  FIXED_INCOME = "FIXED_INCOME",
  FOREIGN_STOCK = "FOREIGN_STOCK",
  PRIVATE = "PRIVATE",
}

export enum InvestmentAssetStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum InvestmentFeeKind {
  BROKERAGE = "BROKERAGE",
  EXCHANGE_FEES = "EXCHANGE_FEES",
  FX_IOF = "FX_IOF",
  // Spec 105: withheld taxes of a fixed income redemption, written by the API only.
  INCOME_TAX = "INCOME_TAX",
  IOF = "IOF",
  OTHER = "OTHER",
}

// Spec 105: fixed income calculated from the rate, enum values identical to the API's.
export enum InvestmentFixedIncomeLiquidity {
  AT_MATURITY = "AT_MATURITY",
  DAILY = "DAILY",
  GRACE_PERIOD = "GRACE_PERIOD",
}

export enum InvestmentFixedIncomeProduct {
  CDB = "CDB",
  CRA = "CRA",
  CRI = "CRI",
  DEBENTURE = "DEBENTURE",
  INCENTIVIZED_DEBENTURE = "INCENTIVIZED_DEBENTURE",
  LCA = "LCA",
  LCI = "LCI",
  OTHER = "OTHER",
  TREASURY = "TREASURY",
}

export enum InvestmentFixedIncomeRateMode {
  CDI_PERCENT = "CDI_PERCENT",
  IPCA_PLUS = "IPCA_PLUS",
  PREFIXED = "PREFIXED",
}

export enum InvestmentFixedIncomeRedemptionKind {
  PARTIAL = "PARTIAL",
  TOTAL = "TOTAL",
}

// Spec 107: enum values are identical to the API's.
export enum InvestmentIncomeStatus {
  PLANNED = "PLANNED",
  RECEIVED = "RECEIVED",
}

export enum InvestmentIncomeType {
  DIVIDEND = "DIVIDEND",
  INTEREST = "INTEREST",
  JCP = "JCP",
  OTHER = "OTHER",
  YIELD = "YIELD",
}

export enum InvestmentOperationType {
  BONUS = "BONUS",
  BUY = "BUY",
  REVERSE_SPLIT = "REVERSE_SPLIT",
  SELL = "SELL",
  SPLIT = "SPLIT",
}

// Spec 104: market-data enums, identical to the API's.
export enum InvestmentPriceKind {
  CLOSE = "CLOSE",
  OPERATION = "OPERATION",
  VALUATION = "VALUATION",
}

export enum InvestmentPriceRange {
  ALL = "ALL",
  ONE_MONTH = "1M",
  ONE_YEAR = "1Y",
  SIX_MONTHS = "6M",
}

export enum InvestmentPriceSource {
  MANUAL = "MANUAL",
  QUOTE = "QUOTE",
}

export enum InvestmentQuoteMarket {
  B3 = "B3",
  US = "US",
}

export enum InvestmentValuationSource {
  MANUAL = "MANUAL",
}

// The classes that have an automatic quote and the market that quotes them (spec 104 FR 1).
export const QUOTED_CLASS_MARKET: Partial<
  Record<InvestmentAssetClass, InvestmentQuoteMarket>
> = {
  [InvestmentAssetClass.BR_REIT]: InvestmentQuoteMarket.B3,
  [InvestmentAssetClass.BR_STOCK]: InvestmentQuoteMarket.B3,
  [InvestmentAssetClass.FOREIGN_STOCK]: InvestmentQuoteMarket.US,
};

// The order of the classes in the list (the API sorts the same way).
export const ASSET_CLASS_ORDER: InvestmentAssetClass[] = [
  InvestmentAssetClass.BR_STOCK,
  InvestmentAssetClass.BR_REIT,
  InvestmentAssetClass.FOREIGN_STOCK,
  InvestmentAssetClass.FIXED_INCOME,
  InvestmentAssetClass.PRIVATE,
];

// Classes whose ticker is required (spec 102 FR 3).
export const TICKER_REQUIRED_CLASSES: InvestmentAssetClass[] = [
  InvestmentAssetClass.BR_STOCK,
  InvestmentAssetClass.BR_REIT,
  InvestmentAssetClass.FOREIGN_STOCK,
];

export const MAX_FEES_PER_OPERATION = 10;

// Spec 108 FR 1: operations that change the position without moving money, in the order of the picker.
export const INVESTMENT_EVENT_TYPES: InvestmentOperationType[] = [
  InvestmentOperationType.SPLIT,
  InvestmentOperationType.REVERSE_SPLIT,
  InvestmentOperationType.BONUS,
];

export function isInvestmentEvent(type: InvestmentOperationType): boolean {
  return INVESTMENT_EVENT_TYPES.includes(type);
}

// Spec 108 FR 9: B3 stocks and REITs hold whole units after an event; the other classes keep 8 places.
export function wholeUnitsAfterEvent(
  assetClass: InvestmentAssetClass,
): boolean {
  return (
    assetClass === InvestmentAssetClass.BR_STOCK ||
    assetClass === InvestmentAssetClass.BR_REIT
  );
}

// Spec 105 FR 2: the products whose income tax is exempt by default (the owner can change it).
export const TAX_EXEMPT_PRODUCTS: InvestmentFixedIncomeProduct[] = [
  InvestmentFixedIncomeProduct.CRA,
  InvestmentFixedIncomeProduct.CRI,
  InvestmentFixedIncomeProduct.INCENTIVIZED_DEBENTURE,
  InvestmentFixedIncomeProduct.LCA,
  InvestmentFixedIncomeProduct.LCI,
];

// Spec 107 FR 1: the types in the order of the dropdown.
export const INVESTMENT_INCOME_TYPES: InvestmentIncomeType[] = [
  InvestmentIncomeType.DIVIDEND,
  InvestmentIncomeType.JCP,
  InvestmentIncomeType.YIELD,
  InvestmentIncomeType.INTEREST,
  InvestmentIncomeType.OTHER,
];

// Spec 107 FR 2: the type the form starts with, per asset class.
export function defaultIncomeType(
  assetClass: InvestmentAssetClass,
): InvestmentIncomeType {
  if (assetClass === InvestmentAssetClass.BR_REIT) {
    return InvestmentIncomeType.YIELD;
  }

  return assetClass === InvestmentAssetClass.FIXED_INCOME
    ? InvestmentIncomeType.INTEREST
    : InvestmentIncomeType.DIVIDEND;
}

// Spec 107 FR 6: the estimated withholding of an income, in basis points of the gross (display only; the API's
// `IncomeWithholding` is the source of truth for the value it returns).
export function incomeWithholdingBps(
  type: InvestmentIncomeType,
  assetClass: InvestmentAssetClass,
): number {
  if (type === InvestmentIncomeType.JCP) {
    return 1500;
  }

  return type === InvestmentIncomeType.DIVIDEND &&
    assetClass === InvestmentAssetClass.FOREIGN_STOCK
    ? 3000
    : 0;
}
