import { CurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
  InvestmentFixedIncomeRedemptionKind,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
  InvestmentOperationType,
  InvestmentPriceKind,
  InvestmentPriceSource,
  InvestmentQuoteMarket,
  InvestmentValuationSource,
} from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface InvestmentAsset {
  archivedAt: null | string;
  assetClass: InvestmentAssetClass;
  // Weighted BRL per USD of the lots still held; USD assets only (spec 104).
  averageFxRate: null | string;
  // BRL numbers of a USD asset; null without a current rate or an average rate.
  brl: InvestmentBrlResult | null;
  currency: CurrencyCode;
  // Spec 105: the computed numbers of a calculated title; null on any other asset.
  fixedIncome: InvestmentFixedIncome | null;
  fx: InvestmentFx | null;
  id: string;
  name: string;
  operationCount: number;
  // Buy operations without an exchange rate: left out of the BRL numbers.
  operationsWithoutFxRate: number;
  owner: OwnerType;
  ownerId: string;
  position: InvestmentPosition;
  // What the current price is: the automatic quote or a manual valuation (null without a price).
  priceSource: InvestmentPriceSource | null;
  quote: InvestmentQuote | null;
  status: InvestmentAssetStatus;
  ticker: null | string;
}

export interface InvestmentAssetDetail extends InvestmentAsset {
  // The detail adds the history, the lots and the projection to the summary of `fixedIncome`.
  fixedIncome: InvestmentFixedIncome | null;
  operations: InvestmentOperation[];
  valuations: InvestmentValuation[];
}

// Integer cents of BRL (spec 104 FR 28).
export interface InvestmentBrlResult {
  cost: number;
  marketValue: number;
  result: number;
  resultFromAsset: number;
  resultFromFx: number;
  // Fraction of the BRL cost (0.3526 = 35.26%).
  resultPercent: null | number;
}

// Money is integer cents in the asset currency; quantities and unit prices are decimal strings (up to 8 places).
export interface InvestmentFee {
  amount: number;
  description: null | string;
  id: string;
  kind: InvestmentFeeKind;
}

// Spec 105 FR 26: cents everywhere; `rates`, `adjustments`, `lots` and `atMaturity` come with the detail only.
export interface InvestmentFixedIncome {
  adjustments: InvestmentFixedIncomeAdjustment[];
  atMaturity: InvestmentFixedIncomeTotals;
  currentEffectiveRate: null | string;
  liquidity: InvestmentFixedIncomeLiquidity;
  liquidityDate: null | string;
  lots: InvestmentFixedIncomeLot[];
  maturityDate: string;
  maturityPending: boolean;
  product: InvestmentFixedIncomeProduct;
  rates: InvestmentFixedIncomeRate[];
  taxExempt: boolean;
  today: InvestmentFixedIncomeTotals;
}

export interface InvestmentFixedIncomeAdjustment {
  date: string;
  grossAmount: number;
  id: string;
}

export interface InvestmentFixedIncomeAdjustmentResult {
  // The gross the curve gave on that date before the adjustment.
  computedGross: number;
  detail: InvestmentAssetDetail;
  item: InvestmentFixedIncomeAdjustment;
}

export interface InvestmentFixedIncomeLot {
  date: string;
  days: number;
  gross: number;
  iof: number;
  iofRate: string;
  ir: number;
  irRate: string;
  net: number;
  operationId: string;
  principal: number;
  remainingPrincipal: number;
}

export interface InvestmentFixedIncomeRate {
  annualRate: null | string;
  cdiPercent: null | string;
  effectiveRate: string;
  id: string;
  indexRate: null | string;
  mode: InvestmentFixedIncomeRateMode;
  spread: null | string;
  startDate: string;
}

export interface InvestmentFixedIncomeRedemptionPreview {
  gross: number;
  iof: number;
  ir: number;
  liquidityWarning: InvestmentFixedIncomeLiquidity | null;
  lots: {
    date: string;
    gross: number;
    operationId: string;
    principalUsed: number;
  }[];
  net: number;
  remaining: { gross: number; principal: number };
}

export interface InvestmentFixedIncomeSimulation {
  atMaturity: InvestmentFixedIncomeTotals;
  effectiveRate: string;
}

export interface InvestmentFixedIncomeTotals {
  gross: number;
  iof: number;
  ir: number;
  net: number;
}

// A contribution or a redemption: the operation, the refreshed detail and the liquidity warning.
export interface InvestmentFixedIncomeWriteResult {
  detail: InvestmentAssetDetail;
  liquidityWarning: InvestmentFixedIncomeLiquidity | null;
  operation: InvestmentOperation;
}

export interface InvestmentFx {
  quotedAt: string;
  // BRL per 1 USD, decimal string.
  rate: string;
}

// Spec 107: money in integer cents, quantity and per-unit value as decimal strings, dates `YYYY-MM-DD`.
export interface InvestmentIncome {
  accountId?: string;
  amountPerUnit?: string;
  assetId: string;
  categoryId?: string;
  currency: CurrencyCode;
  // Display only: estimated gross and withheld tax from the net amount.
  estimatedGross: number;
  estimatedWithheld: number;
  exDate?: string;
  id: string;
  netAmount: number;
  notes?: string;
  // Planned with a payment date before today.
  overdue: boolean;
  paymentDate: string;
  quantity?: string;
  status: InvestmentIncomeStatus;
  suggestionId?: string;
  transactionId?: string;
  type: InvestmentIncomeType;
  // Decimal string, "0.15" = 15%.
  withholdingRate: string;
}

export interface InvestmentIncomeDefaults {
  accountId: null | string;
  categoryId: null | string;
  currency: CurrencyCode;
  quantity: string;
  withholdingRate: string;
}

export interface InvestmentIncomeLink {
  assetId: string;
  incomeId: string;
}

export interface InvestmentIncomePage {
  items: InvestmentIncome[];
  nextCursor: null | string;
  summary?: InvestmentIncomeSummary;
}

export interface InvestmentIncomeSuggestion {
  amountPerUnit: string;
  assetId: string;
  // A payment date, a default account and a default category exist: "Aprovar" creates the income right away.
  canApproveDirectly: boolean;
  currency: CurrencyCode;
  estimatedGross: number;
  estimatedNet: number;
  exDate: string;
  id: string;
  paymentDate?: string;
  quantity: string;
  ticker: string;
  type: InvestmentIncomeType;
  withholdingRate: string;
}

export interface InvestmentIncomeSummary {
  currency: CurrencyCode;
  pendingSuggestions: number;
  plannedTotal: number;
  receivedThisYear: number;
}

export interface InvestmentOperation {
  accountId: null | string;
  // Cost removed by a sell; null on a buy.
  costRemoved: null | number;
  date: string;
  fees: InvestmentFee[];
  feesTotal: number;
  // BRL per USD at the operation date (USD assets only).
  fxRate: null | string;
  generateTransaction: boolean;
  gross: number;
  id: string;
  // Spec 105: the real net of a redemption of a calculated title.
  netAmount: null | number;
  quantity: string;
  // Realized result of a sell; null on a buy.
  realizedResult: null | number;
  redemptionKind: InvestmentFixedIncomeRedemptionKind | null;
  total: number;
  transactionId: null | string;
  type: InvestmentOperationType;
  unitPrice: string;
}

export interface InvestmentOperationResult {
  operation: InvestmentOperation;
  position: InvestmentPosition;
}

export interface InvestmentPosition {
  averagePrice: null | string;
  cost: number;
  currentUnitPrice: null | string;
  currentValue: null | number;
  currentValueDate: null | string;
  openResult: null | number;
  // Fraction of the cost (0.0721 = 7.21%).
  openResultPercent: null | number;
  quantity: string;
  realizedResult: number;
}

export interface InvestmentPriceHistory {
  currency: CurrencyCode;
  // First day with a stored automatic close; null before the first close run.
  historyStartsAt: null | string;
  points: InvestmentPricePoint[];
}

export interface InvestmentPricePoint {
  date: string;
  // BRL per USD of that date (USD assets only).
  fxRate: null | string;
  kind: InvestmentPriceKind;
  price: string;
}

export interface InvestmentQuote {
  changePercent: null | string;
  dayHigh: null | string;
  dayLow: null | string;
  market: InvestmentQuoteMarket;
  previousClose: null | string;
  price: string;
  quotedAt: string;
  source: string;
  stale: boolean;
  ticker: string;
  unavailable: boolean;
}

export interface InvestmentQuotesRefresh {
  fx: null | { pair: string; quotedAt: string; rate: string };
  nextRefreshAt: string;
  quotes: InvestmentQuote[];
}

export interface InvestmentTickerSuggestion {
  changePercent: null | string;
  currency: CurrencyCode;
  exchange: string;
  logoUrl: null | string;
  market: InvestmentQuoteMarket;
  name: null | string;
  price: string;
  ticker: string;
}

export interface InvestmentValuation {
  date: string;
  id: string;
  source: InvestmentValuationSource;
  unitPrice: string;
}

export interface InvestmentValuationResult {
  position: InvestmentPosition;
  valuation: InvestmentValuation;
}
