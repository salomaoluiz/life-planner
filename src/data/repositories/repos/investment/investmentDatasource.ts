import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentOperationResult,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import {
  CreateInvestmentAssetParams,
  CreateInvestmentOperationParams,
  GetInvestmentAssetsParams,
  InvestmentOperationLink,
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
  updateAsset(params: UpdateInvestmentAssetParams): Promise<InvestmentAsset>;
  updateOperation(
    params: UpdateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  upsertValuation(
    params: UpsertInvestmentValuationParams,
  ): Promise<InvestmentValuationResult>;
}
