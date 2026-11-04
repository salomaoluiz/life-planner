import { Datasources } from "@data/datasource";
import TransactionEntity from "@domain/entities/financial/TransactionEntity";

import { toTransactionEntity } from "./getTransactions";

async function getTransactionById(
  id: string,
  datasources: Datasources,
): Promise<TransactionEntity | undefined> {
  const model =
    await datasources.financialTransactionDatasource.getTransactionById(id);

  return model ? toTransactionEntity(model) : undefined;
}

export default getTransactionById;
