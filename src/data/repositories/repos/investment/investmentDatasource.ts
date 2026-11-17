import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentConversion,
  InvestmentConversionResult,
  InvestmentEventSuggestion,
  InvestmentFixedIncomeAdjustmentResult,
  InvestmentFixedIncomeRedemptionPreview,
  InvestmentFixedIncomeSimulation,
  InvestmentFixedIncomeWriteResult,
  InvestmentIncome,
  InvestmentIncomeDefaults,
  InvestmentIncomeLink,
  InvestmentIncomePage,
  InvestmentIncomeSeries,
  InvestmentIncomeSeriesCreated,
  InvestmentIncomeSeriesPreview,
  InvestmentIncomeSuggestion,
  InvestmentMarketIndexes,
  InvestmentMarketIndexHistory,
  InvestmentOperationResult,
  InvestmentPriceHistory,
  InvestmentProjectedIncome,
  InvestmentQuotesRefresh,
  InvestmentsDashboard,
  InvestmentsHomeSummary,
  InvestmentTickerSuggestion,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import {
  ApproveInvestmentEventSuggestionParams,
  ApproveInvestmentIncomeSuggestionParams,
  CreateFixedIncomeContributionParams,
  CreateFixedIncomeRedemptionParams,
  CreateFixedIncomeTitleParams,
  CreateInvestmentAssetParams,
  CreateInvestmentConversionParams,
  CreateInvestmentEventParams,
  CreateInvestmentFractionSaleParams,
  CreateInvestmentIncomeParams,
  CreateInvestmentIncomeSeriesParams,
  CreateInvestmentOperationParams,
  DeleteInvestmentIncomeParams,
  FixedIncomeRateParams,
  GetInvestmentAssetsParams,
  GetInvestmentEventSuggestionsParams,
  GetInvestmentIncomeDefaultsParams,
  GetInvestmentIncomeSeriesProjectionsParams,
  GetInvestmentIncomesParams,
  GetInvestmentIncomeSuggestionsParams,
  GetInvestmentMarketIndexHistoryParams,
  GetInvestmentPriceHistoryParams,
  GetInvestmentsDashboardParams,
  GetInvestmentsHomeSummaryParams,
  InvestmentOperationLink,
  PreviewFixedIncomeRedemptionParams,
  ReceiveInvestmentIncomeParams,
  RefreshInvestmentQuotesParams,
  SearchInvestmentTickersParams,
  SimulateFixedIncomeParams,
  UpdateFixedIncomeRateParams,
  UpdateInvestmentAssetParams,
  UpdateInvestmentConversionParams,
  UpdateInvestmentIncomeParams,
  UpdateInvestmentIncomeSeriesParams,
  UpdateInvestmentOperationParams,
  UpsertFixedIncomeAdjustmentParams,
  UpsertFixedIncomeTermsParams,
  UpsertInvestmentValuationParams,
} from "@domain/repositories/investment";

export interface InvestmentDatasource {
  approveEventSuggestion(
    params: ApproveInvestmentEventSuggestionParams,
  ): Promise<InvestmentOperationResult>;
  approveIncomeSuggestion(
    params: ApproveInvestmentIncomeSuggestionParams,
  ): Promise<InvestmentIncome>;
  createAsset(params: CreateInvestmentAssetParams): Promise<InvestmentAsset>;
  createConversion(
    params: CreateInvestmentConversionParams,
  ): Promise<InvestmentConversionResult>;
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
  createIncomeSeries(
    params: CreateInvestmentIncomeSeriesParams,
  ): Promise<InvestmentIncomeSeriesCreated>;
  createOperation(
    params: CreateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  deleteAsset(id: string): Promise<void>;
  deleteConversion(id: string): Promise<void>;
  deleteFixedIncomeAdjustment(id: string): Promise<void>;
  deleteFixedIncomeRate(id: string): Promise<void>;
  deleteIncome(params: DeleteInvestmentIncomeParams): Promise<void>;
  deleteOperation(id: string): Promise<void>;
  deleteValuation(id: string): Promise<void>;
  getAsset(id: string): Promise<InvestmentAssetDetail>;
  getAssets(params: GetInvestmentAssetsParams): Promise<InvestmentAsset[]>;
  getConversion(id: string): Promise<InvestmentConversion>;
  getDashboard(
    params: GetInvestmentsDashboardParams,
  ): Promise<InvestmentsDashboard>;
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
  getIncomeLink(
    transactionId: string,
  ): Promise<InvestmentIncomeLink | undefined>;
  getIncomes(params: GetInvestmentIncomesParams): Promise<InvestmentIncomePage>;
  getIncomeSeries(assetId: string): Promise<InvestmentIncomeSeries[]>;
  getIncomeSeriesById(id: string): Promise<InvestmentIncomeSeries>;
  getIncomeSeriesProjections(
    params: GetInvestmentIncomeSeriesProjectionsParams,
  ): Promise<InvestmentProjectedIncome[]>;
  getIncomeSuggestions(
    params: GetInvestmentIncomeSuggestionsParams,
  ): Promise<InvestmentIncomeSuggestion[]>;
  getMarketIndexes(): Promise<InvestmentMarketIndexes>;
  getMarketIndexHistory(
    params: GetInvestmentMarketIndexHistoryParams,
  ): Promise<InvestmentMarketIndexHistory>;
  getOperationLink(
    transactionId: string,
  ): Promise<InvestmentOperationLink | undefined>;
  getPriceHistory(
    params: GetInvestmentPriceHistoryParams,
  ): Promise<InvestmentPriceHistory>;
  previewFixedIncomeRedemption(
    params: PreviewFixedIncomeRedemptionParams,
  ): Promise<InvestmentFixedIncomeRedemptionPreview>;
  previewIncomeSeries(
    params: CreateInvestmentIncomeSeriesParams,
  ): Promise<InvestmentIncomeSeriesPreview>;
  receiveIncome(
    params: ReceiveInvestmentIncomeParams,
  ): Promise<InvestmentIncome>;
  refreshMarketIndexes(): Promise<InvestmentMarketIndexes>;
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
  updateConversion(
    params: UpdateInvestmentConversionParams,
  ): Promise<InvestmentConversionResult>;
  updateFixedIncomeRate(
    params: UpdateFixedIncomeRateParams,
  ): Promise<InvestmentAssetDetail>;
  updateIncome(params: UpdateInvestmentIncomeParams): Promise<InvestmentIncome>;
  updateIncomeSeries(
    params: UpdateInvestmentIncomeSeriesParams,
  ): Promise<InvestmentIncomeSeries>;
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
