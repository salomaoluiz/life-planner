import { Datasources } from "@data/datasource";
import { FinancialTransferRepository } from "@domain/repositories/financial";

import { invalidateTransferCaches } from "./invalidateTransferCaches";
import { toTransferResult } from "./toEntities";

export type Params = Parameters<
  FinancialTransferRepository["updateTransfer"]
>[0];

async function updateTransfer(params: Params, datasources: Datasources) {
  const result = await datasources.financialTransferDatasource.updateTransfer({
    amountIn: params.amountIn,
    amountOut: params.amountOut,
    dateIn: params.dateIn,
    dateOut: params.dateOut,
    description: params.description,
    fee: params.fee,
    fromAccountId: params.fromAccountId,
    id: params.id,
    notes: params.notes,
    paid: params.paid,
    scope: params.scope,
    toAccountId: params.toAccountId,
  });

  invalidateTransferCaches();

  return toTransferResult(result);
}

export default updateTransfer;
