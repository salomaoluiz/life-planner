import { Datasources } from "@data/datasource";
import FinanceMonthEntity from "@domain/entities/financial/FinanceMonthEntity";
import {
  ExportFileEntity,
  ImportValidationEntity,
} from "@domain/entities/financial/TransactionCsv";
import TransactionEntity from "@domain/entities/financial/TransactionEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";

import confirmTransaction from "./confirmTransaction";
import createTransaction from "./createTransaction";
import deleteTransaction from "./deleteTransaction";
import getFilteredTransactions from "./getFilteredTransactions";
import getFinanceMonth from "./getFinanceMonth";
import getTransactionById from "./getTransactionById";
import getTransactions from "./getTransactions";
import importTransactions from "./importTransactions";
import updateTransaction from "./updateTransaction";

function transactionRepositoryImpl(
  datasources: Datasources,
): FinancialTransactionRepository {
  return {
    async confirmTransaction(params): Promise<void> {
      return confirmTransaction(params, datasources);
    },
    async createTransaction(params): Promise<TransactionEntity> {
      return createTransaction(params, datasources);
    },
    async deleteTransaction(params): Promise<void> {
      return deleteTransaction(params, datasources);
    },
    async exportTransactions(params): Promise<ExportFileEntity> {
      return datasources.financialTransactionDatasource.exportTransactions(
        params,
      );
    },
    async getExportCount(params): Promise<number> {
      return datasources.financialTransactionDatasource.getExportCount(params);
    },
    async getFilteredTransactions(params): Promise<TransactionEntity[]> {
      return getFilteredTransactions(params, datasources);
    },
    async getFinanceMonth(params): Promise<FinanceMonthEntity> {
      return getFinanceMonth(params, datasources);
    },
    async getTransactionById(id): Promise<TransactionEntity | undefined> {
      return getTransactionById(id, datasources);
    },
    async getTransactions(
      ownerIds,
      range,
      options,
    ): Promise<TransactionEntity[]> {
      return getTransactions(ownerIds, datasources, range, options);
    },
    async hasCategoryTransactions(ownerIds, categoryId): Promise<boolean> {
      return datasources.financialTransactionDatasource.hasCategoryTransactions(
        ownerIds,
        categoryId,
      );
    },
    async importTransactions(params): Promise<number> {
      return importTransactions(params, datasources);
    },
    async updateTransaction(params): Promise<void> {
      return updateTransaction(params, datasources);
    },
    async validateImport(params): Promise<ImportValidationEntity> {
      return datasources.financialTransactionDatasource.validateImport(params);
    },
  };
}

export default transactionRepositoryImpl;
