import { CurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
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

export interface InvestmentFx {
  quotedAt: string;
  // BRL per 1 USD, decimal string.
  rate: string;
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
  quantity: string;
  // Realized result of a sell; null on a buy.
  realizedResult: null | number;
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
