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
import {
  CreateFixedIncomeContributionParams,
  CreateFixedIncomeRedemptionParams,
  CreateFixedIncomeTitleParams,
  CreateInvestmentAssetParams,
  CreateInvestmentOperationParams,
  FixedIncomeRateParams,
  GetInvestmentAssetsParams,
  GetInvestmentPriceHistoryParams,
  InvestmentOperationLink,
  PreviewFixedIncomeRedemptionParams,
  RefreshInvestmentQuotesParams,
  SearchInvestmentTickersParams,
  SimulateFixedIncomeParams,
  UpdateFixedIncomeRateParams,
  UpdateInvestmentAssetParams,
  UpdateInvestmentOperationParams,
  UpsertFixedIncomeAdjustmentParams,
  UpsertFixedIncomeTermsParams,
  UpsertInvestmentValuationParams,
} from "@domain/repositories/investment";

export interface InvestmentDatasource {
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
}
