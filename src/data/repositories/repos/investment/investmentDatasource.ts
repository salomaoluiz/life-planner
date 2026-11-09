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
  updateAsset(params: UpdateInvestmentAssetParams): Promise<InvestmentAsset>;
  updateOperation(
    params: UpdateInvestmentOperationParams,
  ): Promise<InvestmentOperationResult>;
  upsertValuation(
    params: UpsertInvestmentValuationParams,
  ): Promise<InvestmentValuationResult>;
}
