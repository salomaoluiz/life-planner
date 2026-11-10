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
  OTHER = "OTHER",
}

export enum InvestmentOperationType {
  BUY = "BUY",
  SELL = "SELL",
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
