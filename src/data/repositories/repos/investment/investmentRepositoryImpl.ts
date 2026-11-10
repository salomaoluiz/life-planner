import { Datasources } from "@data/datasource";
import { InvestmentRepository } from "@domain/repositories/investment";

// Reads go straight to the API (React Query caches them); there is no repository cache for investments.
function investmentRepositoryImpl(
  datasources: Datasources,
): InvestmentRepository {
  const { investmentDatasource } = datasources;

  return {
    createAsset: async (params) => investmentDatasource.createAsset(params),
    createOperation: async (params) =>
      investmentDatasource.createOperation(params),
    deleteAsset: async (id) => investmentDatasource.deleteAsset(id),
    deleteOperation: async (id) => investmentDatasource.deleteOperation(id),
    deleteValuation: async (id) => investmentDatasource.deleteValuation(id),
    getAsset: async (id) => investmentDatasource.getAsset(id),
    getAssets: async (params) => investmentDatasource.getAssets(params),
    getOperationLink: async (transactionId) =>
      investmentDatasource.getOperationLink(transactionId),
    updateAsset: async (params) => investmentDatasource.updateAsset(params),
    updateOperation: async (params) =>
      investmentDatasource.updateOperation(params),
    upsertValuation: async (params) =>
      investmentDatasource.upsertValuation(params),
  };
}

export default investmentRepositoryImpl;
