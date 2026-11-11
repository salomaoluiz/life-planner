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
    approveIncomeSuggestion: async (params) =>
      withFinanceCaches(investmentDatasource.approveIncomeSuggestion(params)),
    createAsset: async (params) => investmentDatasource.createAsset(params),
    createFixedIncomeContribution: async (params) =>
      withFinanceCaches(
        investmentDatasource.createFixedIncomeContribution(params),
      ),
    createFixedIncomeRate: async (assetId, rate) =>
      investmentDatasource.createFixedIncomeRate(assetId, rate),
    createFixedIncomeRedemption: async (params) =>
      withFinanceCaches(
        investmentDatasource.createFixedIncomeRedemption(params),
      ),
    createFixedIncomeTitle: async (params) =>
      withFinanceCaches(investmentDatasource.createFixedIncomeTitle(params)),
    createIncome: async (params) =>
      withFinanceCaches(investmentDatasource.createIncome(params)),
    createOperation: async (params) =>
      withFinanceCaches(investmentDatasource.createOperation(params)),
    deleteAsset: async (id) =>
      withFinanceCaches(investmentDatasource.deleteAsset(id)),
    deleteFixedIncomeAdjustment: async (id) =>
      investmentDatasource.deleteFixedIncomeAdjustment(id),
    deleteFixedIncomeRate: async (id) =>
      investmentDatasource.deleteFixedIncomeRate(id),
    deleteIncome: async (id) =>
      withFinanceCaches(investmentDatasource.deleteIncome(id)),
    deleteOperation: async (id) =>
      withFinanceCaches(investmentDatasource.deleteOperation(id)),
    deleteValuation: async (id) => investmentDatasource.deleteValuation(id),
    getAsset: async (id) => investmentDatasource.getAsset(id),
    getAssets: async (params) => investmentDatasource.getAssets(params),
    getIncome: async (id) => investmentDatasource.getIncome(id),
    getIncomeDefaults: async (params) =>
      investmentDatasource.getIncomeDefaults(params),
    getIncomeLink: async (transactionId) =>
      investmentDatasource.getIncomeLink(transactionId),
    getIncomes: async (params) => investmentDatasource.getIncomes(params),
    getIncomeSuggestions: async (params) =>
      investmentDatasource.getIncomeSuggestions(params),
    getOperationLink: async (transactionId) =>
      investmentDatasource.getOperationLink(transactionId),
    getPriceHistory: async (params) =>
      investmentDatasource.getPriceHistory(params),
    previewFixedIncomeRedemption: async (params) =>
      investmentDatasource.previewFixedIncomeRedemption(params),
    receiveIncome: async (params) =>
      withFinanceCaches(investmentDatasource.receiveIncome(params)),
    refreshQuotes: async (params) => investmentDatasource.refreshQuotes(params),
    rejectIncomeSuggestion: async (id) =>
      investmentDatasource.rejectIncomeSuggestion(id),
    searchTickers: async (params) => investmentDatasource.searchTickers(params),
    simulateFixedIncome: async (params) =>
      investmentDatasource.simulateFixedIncome(params),
    updateAsset: async (params) => investmentDatasource.updateAsset(params),
    updateFixedIncomeRate: async (params) =>
      investmentDatasource.updateFixedIncomeRate(params),
    updateIncome: async (params) =>
      withFinanceCaches(investmentDatasource.updateIncome(params)),
    updateOperation: async (params) =>
      withFinanceCaches(investmentDatasource.updateOperation(params)),
    upsertFixedIncomeAdjustment: async (params) =>
      investmentDatasource.upsertFixedIncomeAdjustment(params),
    upsertFixedIncomeTerms: async (params) =>
      investmentDatasource.upsertFixedIncomeTerms(params),
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
