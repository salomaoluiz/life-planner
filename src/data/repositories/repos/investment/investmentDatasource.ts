import {
  InvestmentAsset,
  InvestmentAssetDetail,
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
  InvestmentTickerSuggestion,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import {
  ApproveInvestmentIncomeSuggestionParams,
  CreateFixedIncomeContributionParams,
  CreateFixedIncomeRedemptionParams,
  CreateFixedIncomeTitleParams,
  CreateInvestmentAssetParams,
  CreateInvestmentIncomeParams,
  CreateInvestmentOperationParams,
  FixedIncomeRateParams,
  GetInvestmentAssetsParams,
  GetInvestmentIncomeDefaultsParams,
  GetInvestmentIncomesParams,
  GetInvestmentIncomeSuggestionsParams,
  GetInvestmentPriceHistoryParams,
  InvestmentOperationLink,
  PreviewFixedIncomeRedemptionParams,
  ReceiveInvestmentIncomeParams,
  RefreshInvestmentQuotesParams,
  SearchInvestmentTickersParams,
  SimulateFixedIncomeParams,
  UpdateFixedIncomeRateParams,
  UpdateInvestmentAssetParams,
  UpdateInvestmentIncomeParams,
  UpdateInvestmentOperationParams,
  UpsertFixedIncomeAdjustmentParams,
  UpsertFixedIncomeTermsParams,
  UpsertInvestmentValuationParams,
} from "@domain/repositories/investment";

export interface InvestmentDatasource {
  approveIncomeSuggestion(
    params: ApproveInvestmentIncomeSuggestionParams,
  ): Promise<InvestmentIncome>;
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
  getIncome(id: string): Promise<InvestmentIncome>;
  getIncomeDefaults(
    params: GetInvestmentIncomeDefaultsParams,
  ): Promise<InvestmentIncomeDefaults>;
  getIncomeLink(
    transactionId: string,
  ): Promise<InvestmentIncomeLink | undefined>;
  getIncomes(params: GetInvestmentIncomesParams): Promise<InvestmentIncomePage>;
  getIncomeSuggestions(
    params: GetInvestmentIncomeSuggestionsParams,
  ): Promise<InvestmentIncomeSuggestion[]>;
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
}
