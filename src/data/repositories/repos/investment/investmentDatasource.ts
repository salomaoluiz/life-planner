import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentOperationResult,
  InvestmentPriceHistory,
  InvestmentQuotesRefresh,
  InvestmentTickerSuggestion,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import {
  CreateInvestmentAssetParams,
  CreateInvestmentOperationParams,
  GetInvestmentAssetsParams,
  GetInvestmentPriceHistoryParams,
  InvestmentOperationLink,
  RefreshInvestmentQuotesParams,
  SearchInvestmentTickersParams,
  UpdateInvestmentAssetParams,
  UpdateInvestmentOperationParams,
  UpsertInvestmentValuationParams,
} from "@domain/repositories/investment";

export interface InvestmentDatasource {
  createAsset(params: CreateInvestmentAssetParams): Promise<InvestmentAsset>;
  createOperation(
    params: CreateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  deleteAsset(id: string): Promise<void>;
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
}
