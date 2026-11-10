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

export enum InvestmentValuationSource {
  MANUAL = "MANUAL",
}

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
