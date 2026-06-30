import { Datasources } from "@data/datasource";

import categoryRepository from "./categories/categoryRepositoryImpl";
import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(datasources: Datasources) {
  return {
    category: categoryRepository(datasources),
    transaction: transactionRepository(datasources),
  };
}
