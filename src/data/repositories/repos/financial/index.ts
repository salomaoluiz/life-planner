import { Datasources } from "@data/datasource";

import accountRepository from "./accounts/accountRepositoryImpl";
import categoryRepository from "./categories/categoryRepositoryImpl";
import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(datasources: Datasources) {
  return {
    account: accountRepository(datasources),
    category: categoryRepository(datasources),
    transaction: transactionRepository(datasources),
  };
}
