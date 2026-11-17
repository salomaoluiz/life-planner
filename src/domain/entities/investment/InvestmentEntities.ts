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
  // Spec 112 FR 17: where the quotas of a destination came from, and where an origin was converted to.
  convertedFrom?: InvestmentConversionLink[];
  convertedTo?: InvestmentConversionLink | null;
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
  // Spec 108 FR 32: event suggestions waiting for a decision (list only, 0 elsewhere) and fractions still to sell.
  pendingEventSuggestions: number;
  pendingFractionCount: number;
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

// Spec 112: `ticker` is undefined when the counterpart has none.
export interface InvestmentConversion {
  cashAmount?: number;
  cashReferenceUnitValue?: string;
  date: string;
  from: InvestmentConversionSide;
  id: string;
  // Spec 112 FR 19: the destination was converted again, so edit and delete are refused.
  locked: boolean;
  ratioFrom: string;
  ratioTo: string;
  to: InvestmentConversionSide & {
    fractionCost: number;
    fractionQuantity: string;
  };
}

export interface InvestmentConversionLink {
  assetId: string;
  conversionId: string;
  date: string;
  ticker?: string;
}

export interface InvestmentConversionResult {
  conversion: InvestmentConversion;
  fromPosition: InvestmentPosition;
  toPosition: InvestmentPosition;
}

export interface InvestmentConversionSide {
  assetId: string;
  // Cents (`costOut` / `costIn`).
  cost: number;
  operationId: string;
  quantity: string;
  ticker?: string;
}

export interface InvestmentDashboardAllocation {
  assetClass: InvestmentAssetClass;
  share: number;
  // The foreign currency assets of the class, at the rate of the period end.
  usd?: {
    fxRate: string;
    resultFromAsset: number;
    resultFromFx: number;
    value: string;
  };
  value: number;
}

// Spec 110: the investments overview of a period, everything in BRL cents. Shares and percents are fractions (0.1315 = 13.15%).
export type InvestmentDashboardBucket = "DAY" | "MONTH" | "WEEK";

export interface InvestmentDashboardIncome {
  byType: Record<InvestmentIncomeType, number>;
  date: string;
  planned: number;
  received: number;
}

// `null` before the first operation of the filtered assets (a gap in the chart, never a zero).
export interface InvestmentDashboardPoint {
  date: string;
  invested: null | number;
  marketValue: null | number;
}

export interface InvestmentDashboardRanking {
  assetClass: InvestmentAssetClass;
  assetId: string;
  currency: CurrencyCode;
  name: string;
  openResult: number;
  openResultPercent: null | number;
  share: number;
  ticker: null | string;
  usdValue?: string;
  value: number;
  valueKind: InvestmentDashboardValueKind;
}

export interface InvestmentDashboardSummary {
  assetsWithoutValue: number;
  currentValue: number;
  historyStartsAt: null | string;
  incomePlanned: number;
  incomeReceived: number;
  invested: number;
  openResult: number;
  openResultPercent: null | number;
  operationsWithoutFxRate: number;
  realizedResult: number;
  salesCount: number;
  staleQuotes: number;
}

export type InvestmentDashboardValueKind =
  | "COST"
  | "FIXED_INCOME_NET"
  | "MANUAL"
  | "QUOTE";

// Money is integer cents in the asset currency; quantities and unit prices are decimal strings (up to 8 places).
// Spec 108: an announced event suggested for an asset. Ratios and percent are decimal strings, `date` is the data-com.
export interface InvestmentEventSuggestion {
  assetId: string;
  averagePriceAfter?: string;
  averagePriceBefore?: string;
  bonusPercent?: string;
  bonusUnitCost?: string;
  currency: CurrencyCode;
  date: string;
  fractionQuantity: string;
  id: string;
  quantityAfter: string;
  quantityBefore: string;
  ratioFrom?: string;
  ratioTo?: string;
  ticker: string;
  type: InvestmentOperationType;
}

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
  // Spec 113 FR 14: an indexed rate with no stored index; the totals are zero and the screens wait for the Central Bank.
  indexMissing: boolean;
  liquidity: InvestmentFixedIncomeLiquidity;
  liquidityDate: null | string;
  lots: InvestmentFixedIncomeLot[];
  maturityDate: string;
  maturityPending: boolean;
  // Spec 113 FR 16: a redemption the recalculated curve no longer covers.
  needsReview: InvestmentFixedIncomeReview | null;
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

export interface InvestmentFixedIncomeReview {
  date: string;
  operationId: string;
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

export type InvestmentMarketIndex = "CDI" | "IPCA" | "SELIC";

export interface InvestmentMarketIndexCdi {
  annual: null | string;
  daily: null | string;
  date: string;
  followers: number;
  lastChangeDate: null | string;
  stale: boolean;
}

export interface InvestmentMarketIndexChange {
  // Percentage points since the previous change, `null` for the first one of the period.
  delta: null | string;
  since: string;
  value: string;
}

// Spec 113 section 7: decimal strings, dates `YYYY-MM-DD`, instants ISO strings; an index is `null` before the first run.
export interface InvestmentMarketIndexes {
  cdi: InvestmentMarketIndexCdi | null;
  fx: InvestmentMarketIndexFx[];
  ipca: InvestmentMarketIndexIpca | null;
  lastSuccessAt: null | string;
  selic: InvestmentMarketIndexSelic | null;
}
export interface InvestmentMarketIndexFollower {
  assetId: string;
  name: string;
  // The percent of the CDI, or the spread over the IPCA.
  percent?: string;
  spread?: string;
}

export interface InvestmentMarketIndexFx {
  pair: string;
  quotedAt: string;
  rate: string;
}

export interface InvestmentMarketIndexHistory {
  changes: InvestmentMarketIndexChange[];
  followers: InvestmentMarketIndexFollower[];
  index: InvestmentMarketIndex;
  points: InvestmentMarketIndexPoint[];
}

export interface InvestmentMarketIndexIpca {
  accumulated12m: null | string;
  expected12m: null | string;
  expectedDate: null | string;
  followers: number;
  month: null | string;
  monthly: null | string;
  stale: boolean;
}

// A step of the CDI or the Selic (`date`, `value`), or a month of the IPCA (`month`, `monthly`, `accumulated12m`).
export interface InvestmentMarketIndexPoint {
  accumulated12m?: null | string;
  date?: string;
  month?: string;
  monthly?: string;
  value?: string;
}

export interface InvestmentMarketIndexSelic {
  daily: null | string;
  date: string;
  followers: number;
  lastChangeDate: null | string;
  stale: boolean;
  target: null | string;
}

export interface InvestmentOperation {
  accountId: null | string;
  // Spec 112 FR 22: set on CONVERSION_OUT / CONVERSION_IN (the counterpart, ratio and cash part).
  conversion?: InvestmentOperationConversion;
  // Spec 112 FR 12: `costOut` on the OUT, `costIn` on the IN (cents).
  conversionCost?: number;
  // Spec 108: the numbers of a split, reverse split or bonus; undefined on any other operation. The money fields
  // below are zero for an event.
  corporateEvent?: InvestmentOperationEvent;
  // Cost removed by a sell; null on a buy.
  costRemoved: null | number;
  date: string;
  fees: InvestmentFee[];
  feesTotal: number;
  // Spec 108 FR 15: set on the sale of the fraction an event left; the id of that event.
  fractionOfOperationId?: string;
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

// Spec 112 FR 22: what a conversion operation says about the other side.
export interface InvestmentOperationConversion {
  assetId: string;
  cashAmount?: number;
  cashReferenceUnitValue?: string;
  conversionId: string;
  locked: boolean;
  ratioFrom: string;
  ratioTo: string;
  ticker?: string;
}

// Spec 108 FR 12: what the event did to the position, as the API computed it.
export interface InvestmentOperationEvent {
  averagePriceAfter: null | string;
  averagePriceBefore: null | string;
  bonusPercent?: string;
  bonusUnitCost?: string;
  // Cents of the cost that left the position with the fraction.
  fractionCost: number;
  fractionQuantity: string;
  quantityAfter: string;
  quantityBefore: string;
  ratioFrom?: string;
  ratioTo?: string;
}

export interface InvestmentOperationResult {
  operation: InvestmentOperation;
  position: InvestmentPosition;
}

// Spec 108 FR 12: a fraction that left the position and waits for its sale.
export interface InvestmentPendingFraction {
  cost: number;
  date: string;
  eventId: string;
  quantity: string;
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
  pendingFractions: InvestmentPendingFraction[];
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

export interface InvestmentsDashboard {
  allocation: InvestmentDashboardAllocation[];
  incomes: InvestmentDashboardIncome[];
  period: { bucket: InvestmentDashboardBucket; from: string; to: string };
  ranking: InvestmentDashboardRanking[];
  series: InvestmentDashboardPoint[];
  summary: InvestmentDashboardSummary;
}

// Spec 109: the home section in BRL cents. `resultBasisPoints` 1315 = 13.15%, undefined at zero cost.
export interface InvestmentsHomeSummary {
  currentValueCents: number;
  hasPositions: boolean;
  income: {
    count: number;
    month: string;
    pendingSuggestions: number;
    totalCents: number;
  };
  investedCents: number;
  nextMaturity?: {
    assetId: string;
    currency: CurrencyCode;
    maturityDate: string;
    name: string;
    netEstimatedCents: number;
  };
  quotes: {
    asOf?: Date;
    manualCount: number;
    stale: boolean;
    withoutPrice: number;
  };
  resultBasisPoints?: number;
  resultCents: number;
}

export interface InvestmentTickerSuggestion {
  // Spec 111: the class the ticker belongs to, `null` when none applies or the kind is unknown.
  assetClass: InvestmentAssetClass | null;
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
