import { Datasources } from "@data/datasource";
import { FinancialTransferRepository } from "@domain/repositories/financial";

import { invalidateTransferCaches } from "./invalidateTransferCaches";

export type Params = Parameters<
  FinancialTransferRepository["deleteTransfer"]
>[0];

async function deleteTransfer(params: Params, datasources: Datasources) {
  await datasources.financialTransferDatasource.deleteTransfer({
    id: params.id,
    scope: params.scope,
  });

  invalidateTransferCaches();
}

export default deleteTransfer;
