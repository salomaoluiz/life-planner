import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
  InvestmentFixedIncomeRedemptionKind,
  InvestmentOperationType,
  InvestmentPriceRange,
  InvestmentQuoteMarket,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentFixedIncomeAdjustmentResult,
  InvestmentFixedIncomeRedemptionPreview,
  InvestmentFixedIncomeSimulation,
  InvestmentFixedIncomeWriteResult,
  InvestmentOperationResult,
  InvestmentPriceHistory,
  InvestmentQuotesRefresh,
  InvestmentTickerSuggestion,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface CreateFixedIncomeContributionParams {
  accountId?: string;
  // Cents.
  amount: number;
  assetId: string;
  date: string;
  generateTransaction: boolean;
}

export interface CreateFixedIncomeRedemptionParams {
  accountId?: string;
  assetId: string;
  date: string;
  generateTransaction: boolean;
  kind: InvestmentFixedIncomeRedemptionKind;
  // Cents that really landed in the account.
  netAmount: number;
}

export interface CreateFixedIncomeTitleParams {
  contribution: {
    accountId?: string;
    amount: number;
    date: string;
    generateTransaction: boolean;
  };
  name: string;
  owner: OwnerType;
  ownerId: string;
  rate: FixedIncomeRateParams;
  terms: FixedIncomeTermsParams;
}

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

// Spec 105: a rate as the owner types it; the API derives the effective rate.
export interface FixedIncomeRateParams {
  // Percentages as decimal text ("110", "14,90" is normalized by the datasource).
  annualRate?: string;
  cdiPercent?: string;
  indexRate?: string;
  mode: InvestmentFixedIncomeRateMode;
  spread?: string;
  // `YYYY-MM-DD`; absent on the first rate of a new title (it starts on the contribution date).
  startDate?: string;
}

export interface FixedIncomeTermsParams {
  liquidity: InvestmentFixedIncomeLiquidity;
  // `YYYY-MM-DD`, only for `GRACE_PERIOD`.
  liquidityDate?: null | string;
  maturityDate: string;
  product: InvestmentFixedIncomeProduct;
  taxExempt: boolean;
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
  createFixedIncomeContribution(
    params: CreateFixedIncomeContributionParams,
  ): Promise<InvestmentFixedIncomeWriteResult>;
  createFixedIncomeRate(
    assetId: string,
    rate: FixedIncomeRateParams,
  ): Promise<InvestmentAssetDetail>;
  createFixedIncomeRedemption(
    params: CreateFixedIncomeRedemptionParams,
  ): Promise<InvestmentFixedIncomeWriteResult>;
  createFixedIncomeTitle(
    params: CreateFixedIncomeTitleParams,
  ): Promise<InvestmentAssetDetail>;
  createOperation(
    params: CreateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  deleteAsset(id: string): Promise<void>;
  deleteFixedIncomeAdjustment(id: string): Promise<void>;
  deleteFixedIncomeRate(id: string): Promise<void>;
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
  previewFixedIncomeRedemption(
    params: PreviewFixedIncomeRedemptionParams,
  ): Promise<InvestmentFixedIncomeRedemptionPreview>;
  refreshQuotes(
    params: RefreshInvestmentQuotesParams,
  ): Promise<InvestmentQuotesRefresh>;
  searchTickers(
    params: SearchInvestmentTickersParams,
  ): Promise<InvestmentTickerSuggestion[]>;
  simulateFixedIncome(
    params: SimulateFixedIncomeParams,
  ): Promise<InvestmentFixedIncomeSimulation>;
  updateAsset(params: UpdateInvestmentAssetParams): Promise<InvestmentAsset>;
  updateFixedIncomeRate(
    params: UpdateFixedIncomeRateParams,
  ): Promise<InvestmentAssetDetail>;
  updateOperation(
    params: UpdateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  upsertFixedIncomeAdjustment(
    params: UpsertFixedIncomeAdjustmentParams,
  ): Promise<InvestmentFixedIncomeAdjustmentResult>;
  upsertFixedIncomeTerms(
    params: UpsertFixedIncomeTermsParams,
  ): Promise<InvestmentAssetDetail>;
  upsertValuation(
    params: UpsertInvestmentValuationParams,
  ): Promise<InvestmentValuationResult>;
};

export interface PreviewFixedIncomeRedemptionParams {
  assetId: string;
  date: string;
  kind: InvestmentFixedIncomeRedemptionKind;
  netAmount: number;
}

export interface RefreshInvestmentQuotesParams {
  assetIds?: string[];
}

export interface SearchInvestmentTickersParams {
  market: InvestmentQuoteMarket;
  q: string;
}

export interface SimulateFixedIncomeParams {
  amount: number;
  date: string;
  maturityDate: string;
  rate: FixedIncomeRateParams;
  taxExempt: boolean;
}

export interface UpdateFixedIncomeRateParams {
  id: string;
  rate: FixedIncomeRateParams;
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

export interface UpsertFixedIncomeAdjustmentParams {
  assetId: string;
  date: string;
  // Cents.
  grossAmount: number;
}

export interface UpsertFixedIncomeTermsParams {
  assetId: string;
  // Required to convert a manual asset.
  rate?: FixedIncomeRateParams;
  terms: FixedIncomeTermsParams;
}

export interface UpsertInvestmentValuationParams {
  assetId: string;
  date: string;
  unitPrice: string;
}
