import { Datasources } from "@data/datasource";
import { InvestmentRepository } from "@domain/repositories/investment";
import cache, { CacheStringKeys } from "@infrastructure/cache";

// An operation (or deleting an asset with its linked rows) moves account balances and finance rows on the API:
// the repository caches of those lists must not serve the old ones.
function invalidateFinanceCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
}

// Reads go straight to the API (React Query caches them); there is no repository cache for investments.
function investmentRepositoryImpl(
  datasources: Datasources,
): InvestmentRepository {
  const { investmentDatasource } = datasources;

  return {
    createAsset: async (params) => investmentDatasource.createAsset(params),
    createOperation: async (params) =>
      withFinanceCaches(investmentDatasource.createOperation(params)),
    deleteAsset: async (id) =>
      withFinanceCaches(investmentDatasource.deleteAsset(id)),
    deleteOperation: async (id) =>
      withFinanceCaches(investmentDatasource.deleteOperation(id)),
    deleteValuation: async (id) => investmentDatasource.deleteValuation(id),
    getAsset: async (id) => investmentDatasource.getAsset(id),
    getAssets: async (params) => investmentDatasource.getAssets(params),
    getOperationLink: async (transactionId) =>
      investmentDatasource.getOperationLink(transactionId),
    getPriceHistory: async (params) =>
      investmentDatasource.getPriceHistory(params),
    refreshQuotes: async (params) => investmentDatasource.refreshQuotes(params),
    searchTickers: async (params) => investmentDatasource.searchTickers(params),
    updateAsset: async (params) => investmentDatasource.updateAsset(params),
    updateOperation: async (params) =>
      withFinanceCaches(investmentDatasource.updateOperation(params)),
    upsertValuation: async (params) =>
      investmentDatasource.upsertValuation(params),
  };
}

async function withFinanceCaches<T>(write: Promise<T>): Promise<T> {
  const result = await write;

  invalidateFinanceCaches();

  return result;
}

export default investmentRepositoryImpl;
