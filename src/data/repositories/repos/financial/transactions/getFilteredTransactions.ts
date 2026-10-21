import { Datasources } from "@data/datasource";
import { FinancialTransactionRepository } from "@domain/repositories/financial";

import { toTransactionEntity } from "./getTransactions";

export type Params = Parameters<
  FinancialTransactionRepository["getFilteredTransactions"]
>[0];

async function getFilteredTransactions(
  params: Params,
  datasources: Datasources,
) {
  const models =
    await datasources.financialTransactionDatasource.getFilteredTransactions(
      params,
    );

  return models.map((model) => toTransactionEntity(model));
}

export default getFilteredTransactions;
