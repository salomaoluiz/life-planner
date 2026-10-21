import { Datasources } from "@data/datasource";
import TransactionEntity from "@domain/entities/financial/TransactionEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";

import createTransaction from "./createTransaction";
import deleteTransaction from "./deleteTransaction";
import getFilteredTransactions from "./getFilteredTransactions";
import getTransactions from "./getTransactions";
import updateTransaction from "./updateTransaction";

function transactionRepositoryImpl(
  datasources: Datasources,
): FinancialTransactionRepository {
  return {
    async createTransaction(params): Promise<TransactionEntity> {
      return createTransaction(params, datasources);
    },
    async deleteTransaction(params): Promise<void> {
      return deleteTransaction(params, datasources);
    },
    async getFilteredTransactions(params): Promise<TransactionEntity[]> {
      return getFilteredTransactions(params, datasources);
    },
    async getTransactions(ownerIds): Promise<TransactionEntity[]> {
      return getTransactions(ownerIds, datasources);
    },
    async updateTransaction(params): Promise<void> {
      return updateTransaction(params, datasources);
    },
  };
}

export default transactionRepositoryImpl;
