import { Datasources } from "@data/datasource";
import { FinancialCardCreditRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function cardCreditRepositoryImpl(
  datasources: Datasources,
): FinancialCardCreditRepository {
  function datasource() {
    return datasources.financialCardCreditDatasource;
  }

  return {
    async createEarlyPayment(params): Promise<void> {
      await datasource().createEarlyPayment(params);
      invalidateFinancialCaches();
    },
    async createRefund(params): Promise<void> {
      await datasource().createRefund(params);
      invalidateFinancialCaches();
    },
    async deleteEarlyPayment(params): Promise<void> {
      await datasource().deleteEarlyPayment(params);
      invalidateFinancialCaches();
    },
    async deleteRefund(params): Promise<void> {
      await datasource().deleteRefund(params);
      invalidateFinancialCaches();
    },
    async updateEarlyPayment(params): Promise<void> {
      await datasource().updateEarlyPayment(params);
      invalidateFinancialCaches();
    },
    async updateRefund(params): Promise<void> {
      await datasource().updateRefund(params);
      invalidateFinancialCaches();
    },
  };
}

// Credits change invoices and, for an early payment from an account, the account balance.
function invalidateFinancialCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export default cardCreditRepositoryImpl;
