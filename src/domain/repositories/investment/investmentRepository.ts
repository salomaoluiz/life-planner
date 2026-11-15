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
  InvestmentPriceRange,
  InvestmentQuoteMarket,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentEventSuggestion,
  InvestmentFixedIncomeAdjustmentResult,
  InvestmentFixedIncomeRedemptionPreview,
  InvestmentFixedIncomeSimulation,
  InvestmentFixedIncomeWriteResult,
  InvestmentIncome,
  InvestmentIncomeDefaults,
  InvestmentIncomeLink,
  InvestmentIncomePage,
  InvestmentIncomeSuggestion,
  InvestmentOperationResult,
  InvestmentPriceHistory,
  InvestmentQuotesRefresh,
  InvestmentsHomeSummary,
  InvestmentTickerSuggestion,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

// Spec 108: the id of the suggestion; any other field overrides what the provider announced (the edit path).
export interface ApproveInvestmentEventSuggestionParams {
  bonusPercent?: string;
  bonusUnitCost?: null | string;
  date?: string;
  id: string;
  ratioFrom?: string;
  ratioTo?: string;
  type?: InvestmentOperationType;
}

// Spec 107: the fields the owner types; nullish optional ones are sent as `null` to clear them on edit.
export interface ApproveInvestmentIncomeSuggestionParams extends Partial<InvestmentIncomeFields> {
  id: string;
}

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

// Spec 108 FR 4-5: a split / reverse split needs the ratio, a bonus the percent (and optionally the cost per share).
export interface CreateInvestmentEventParams {
  assetId: string;
  bonusPercent?: string;
  bonusUnitCost?: string;
  // `YYYY-MM-DD`, the data-com.
  date: string;
  ratioFrom?: string;
  ratioTo?: string;
  type: InvestmentOperationType;
}

// Spec 108 FR 15: the cash of a fraction auction (`grossAmount` in cents; 0 writes the fraction off).
export interface CreateInvestmentFractionSaleParams {
  accountId?: string;
  date: string;
  eventId: string;
  fees: InvestmentFeeParams[];
  generateTransaction: boolean;
  grossAmount: number;
}

export interface CreateInvestmentIncomeParams extends InvestmentIncomeFields {
  assetId: string;
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

export interface GetInvestmentEventSuggestionsParams {
  assetId?: string;
}

export interface GetInvestmentIncomeDefaultsParams {
  assetId: string;
  exDate?: string;
  type?: InvestmentIncomeType;
}

export interface GetInvestmentIncomesParams {
  assetId?: string;
  cursor?: string;
  // Period of the cross-asset list (`YYYY-MM-DD`, up to 2 years).
  from?: string;
  limit?: number;
  status?: InvestmentIncomeStatus;
  to?: string;
  type?: InvestmentIncomeType;
}

export interface GetInvestmentIncomeSuggestionsParams {
  assetId?: string;
}

export interface GetInvestmentPriceHistoryParams {
  id: string;
  range: InvestmentPriceRange;
}

export interface GetInvestmentsHomeSummaryParams {
  ownerIds: string[];
  // The client's local calendar date, `YYYY-MM-DD`.
  today: string;
}

export interface InvestmentFeeParams {
  // Cents.
  amount: number;
  description?: string;
  kind: InvestmentFeeKind;
}

export interface InvestmentIncomeFields {
  accountId: string;
  amountPerUnit?: null | string;
  categoryId: string;
  exDate?: null | string;
  // Cents that landed (or will land) in the account.
  netAmount: number;
  notes?: null | string;
  paymentDate: string;
  quantity?: null | string;
  status: InvestmentIncomeStatus;
  type: InvestmentIncomeType;
}

export interface InvestmentOperationLink {
  assetId: string;
  operationId: string;
}

export type InvestmentRepository = {
  approveEventSuggestion(
    params: ApproveInvestmentEventSuggestionParams,
  ): Promise<InvestmentOperationResult>;
  approveIncomeSuggestion(
    params: ApproveInvestmentIncomeSuggestionParams,
  ): Promise<InvestmentIncome>;
  createAsset(params: CreateInvestmentAssetParams): Promise<InvestmentAsset>;
  createEvent(
    params: CreateInvestmentEventParams,
  ): Promise<InvestmentOperationResult>;
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
  createFractionSale(
    params: CreateInvestmentFractionSaleParams,
  ): Promise<InvestmentOperationResult>;
  createIncome(params: CreateInvestmentIncomeParams): Promise<InvestmentIncome>;
  createOperation(
    params: CreateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  deleteAsset(id: string): Promise<void>;
  deleteFixedIncomeAdjustment(id: string): Promise<void>;
  deleteFixedIncomeRate(id: string): Promise<void>;
  deleteIncome(id: string): Promise<void>;
  deleteOperation(id: string): Promise<void>;
  deleteValuation(id: string): Promise<void>;
  getAsset(id: string): Promise<InvestmentAssetDetail>;
  getAssets(params: GetInvestmentAssetsParams): Promise<InvestmentAsset[]>;
  getEventSuggestions(
    params: GetInvestmentEventSuggestionsParams,
  ): Promise<InvestmentEventSuggestion[]>;
  getHomeSummary(
    params: GetInvestmentsHomeSummaryParams,
  ): Promise<InvestmentsHomeSummary>;
  getIncome(id: string): Promise<InvestmentIncome>;
  getIncomeDefaults(
    params: GetInvestmentIncomeDefaultsParams,
  ): Promise<InvestmentIncomeDefaults>;
  // The income behind a locked finance row (spec 107 FR 16); undefined for any other row.
  getIncomeLink(
    transactionId: string,
  ): Promise<InvestmentIncomeLink | undefined>;
  getIncomes(params: GetInvestmentIncomesParams): Promise<InvestmentIncomePage>;
  getIncomeSuggestions(
    params: GetInvestmentIncomeSuggestionsParams,
  ): Promise<InvestmentIncomeSuggestion[]>;
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
  receiveIncome(
    params: ReceiveInvestmentIncomeParams,
  ): Promise<InvestmentIncome>;
  refreshQuotes(
    params: RefreshInvestmentQuotesParams,
  ): Promise<InvestmentQuotesRefresh>;
  rejectEventSuggestion(id: string): Promise<void>;
  rejectIncomeSuggestion(id: string): Promise<void>;
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
  updateIncome(params: UpdateInvestmentIncomeParams): Promise<InvestmentIncome>;
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

export interface ReceiveInvestmentIncomeParams {
  accountId?: string;
  id: string;
  // Cents that really landed; the planned value when omitted.
  netAmount?: number;
  // `YYYY-MM-DD`, today when omitted.
  receivedOn?: string;
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

export interface UpdateInvestmentIncomeParams extends Partial<InvestmentIncomeFields> {
  id: string;
}

export interface UpdateInvestmentOperationParams {
  accountId?: null | string;
  // Spec 108: the fields of an event (null clears the cost per new share) and the auction amount of a fraction sale.
  bonusPercent?: string;
  bonusUnitCost?: null | string;
  date?: string;
  fees?: InvestmentFeeParams[];
  fxRate?: null | string;
  generateTransaction?: boolean;
  grossAmount?: number;
  id: string;
  quantity?: string;
  ratioFrom?: string;
  ratioTo?: string;
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
