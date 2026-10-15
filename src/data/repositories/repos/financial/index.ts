import { Datasources } from "@data/datasource";

import accountRepository from "./accounts/accountRepositoryImpl";
import categoryRepository from "./categories/categoryRepositoryImpl";
import creditCardRepository from "./creditCards/creditCardRepositoryImpl";
import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(datasources: Datasources) {
  return {
    account: accountRepository(datasources),
    category: categoryRepository(datasources),
    creditCard: creditCardRepository(datasources),
    transaction: transactionRepository(datasources),
  };
}
