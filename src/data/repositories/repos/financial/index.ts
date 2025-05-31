import { Datasources } from "@data/datasource";
import Repositories from "@domain/repositories";

import categoriesRepository from "./categories/categoryRepositoryImpl";
import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(
  datasources: Datasources,
): Repositories["financialRepository"] {
  return {
    categories: categoriesRepository(datasources),
    transaction: transactionRepository(datasources),
  };
}
