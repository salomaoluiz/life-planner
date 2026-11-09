import { Datasources } from "@data/datasource";
import { FinancialTransferRepository } from "@domain/repositories/financial";

import { invalidateTransferCaches } from "./invalidateTransferCaches";
import { toTransferResult } from "./toEntities";

export type Params = Parameters<
  FinancialTransferRepository["createTransfer"]
>[0];

async function createTransfer(params: Params, datasources: Datasources) {
  const result = await datasources.financialTransferDatasource.createTransfer({
    amountIn: params.amountIn,
    amountOut: params.amountOut,
    dateIn: params.dateIn,
    dateOut: params.dateOut,
    description: params.description,
    fee: params.fee,
    fromAccountId: params.fromAccountId,
    notes: params.notes,
    paid: params.paid,
    recurrence: params.recurrence,
    toAccountId: params.toAccountId,
  });

  invalidateTransferCaches();

  return toTransferResult(result);
}

export default createTransfer;
