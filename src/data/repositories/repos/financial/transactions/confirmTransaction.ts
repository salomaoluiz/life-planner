import { Datasources } from "@data/datasource";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["confirmTransaction"]
>[0];

async function confirmTransaction(params: Params, datasources: Datasources) {
  await datasources.financialTransactionDatasource.confirmTransaction({
    date: params.date,
    id: params.id,
    invoiceMonth: params.invoiceMonth,
    ownerId: params.ownerId,
    value: params.value,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  // The invoice total, the card limit and the forecasts moved.
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export default confirmTransaction;
