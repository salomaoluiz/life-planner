import { Datasources } from "@data/datasource";

import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(datasources: Datasources) {
  return {
    transaction: transactionRepository(datasources),
  };
}
