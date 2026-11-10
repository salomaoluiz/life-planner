import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentOperationType,
  InvestmentPriceRange,
  InvestmentQuoteMarket,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentOperationResult,
  InvestmentPriceHistory,
  InvestmentQuotesRefresh,
  InvestmentTickerSuggestion,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface CreateInvestmentAssetParams {
  assetClass: InvestmentAssetClass;
  currency?: string;
  // Decimal text; creates the first valuation dated today.
  currentUnitPrice?: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  ticker?: string;
}

export interface CreateInvestmentOperationParams {
  accountId?: string;
  assetId: string;
  // `YYYY-MM-DD`
  date: string;
  fees: InvestmentFeeParams[];
  // BRL per USD; omitted = the API defaults it (USD assets).
  fxRate?: null | string;
  generateTransaction: boolean;
  quantity: string;
  type: InvestmentOperationType;
  unitPrice: string;
}

// The app filters All / Personal / Family on the client, so the API call has no owner filter.
export interface GetInvestmentAssetsParams {
  status: InvestmentAssetStatus;
}

export interface GetInvestmentPriceHistoryParams {
  id: string;
  range: InvestmentPriceRange;
}

export interface InvestmentFeeParams {
  // Cents.
  amount: number;
  description?: string;
  kind: InvestmentFeeKind;
}

export interface InvestmentOperationLink {
  assetId: string;
  operationId: string;
}

export type InvestmentRepository = {
  createAsset(params: CreateInvestmentAssetParams): Promise<InvestmentAsset>;
  createOperation(
    params: CreateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  deleteAsset(id: string): Promise<void>;
  deleteOperation(id: string): Promise<void>;
  deleteValuation(id: string): Promise<void>;
  getAsset(id: string): Promise<InvestmentAssetDetail>;
  getAssets(params: GetInvestmentAssetsParams): Promise<InvestmentAsset[]>;
  // The operation behind a finance row of an investment category; undefined for any other row.
  getOperationLink(
    transactionId: string,
  ): Promise<InvestmentOperationLink | undefined>;
  getPriceHistory(
    params: GetInvestmentPriceHistoryParams,
  ): Promise<InvestmentPriceHistory>;
  refreshQuotes(
    params: RefreshInvestmentQuotesParams,
  ): Promise<InvestmentQuotesRefresh>;
  searchTickers(
    params: SearchInvestmentTickersParams,
  ): Promise<InvestmentTickerSuggestion[]>;
  updateAsset(params: UpdateInvestmentAssetParams): Promise<InvestmentAsset>;
  updateOperation(
    params: UpdateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  upsertValuation(
    params: UpsertInvestmentValuationParams,
  ): Promise<InvestmentValuationResult>;
};

export interface RefreshInvestmentQuotesParams {
  assetIds?: string[];
}

export interface SearchInvestmentTickersParams {
  market: InvestmentQuoteMarket;
  q: string;
}

export interface UpdateInvestmentAssetParams {
  assetClass?: InvestmentAssetClass;
  currency?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  status?: InvestmentAssetStatus;
  // `null` clears it.
  ticker?: null | string;
}

export interface UpdateInvestmentOperationParams {
  accountId?: null | string;
  date?: string;
  fees?: InvestmentFeeParams[];
  fxRate?: null | string;
  generateTransaction?: boolean;
  id: string;
  quantity?: string;
  unitPrice?: string;
}

export interface UpsertInvestmentValuationParams {
  assetId: string;
  date: string;
  unitPrice: string;
}
