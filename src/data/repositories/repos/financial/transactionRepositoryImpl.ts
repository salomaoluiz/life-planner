import { Datasources } from "@data/datasource";
import TransactionModel from "@data/models/financial/TransactionModel";
import TransactionEntity, {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function transactionRepositoryImpl(
  datasources: Datasources,
): FinancialTransactionRepository {
  return {
    async createTransaction(params): Promise<TransactionEntity> {
      const transaction =
        await datasources.financialTransactionDatasource.createTransaction({
          category: params.category,
          date: params.date,
          description: params.description,
          owner: params.owner,
          ownerId: params.ownerId,
          type: params.type,
          value: params.value,
        });

      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);

      return new TransactionEntity({
        category: transaction.category,
        date: transaction.date,
        description: transaction.description,
        id: transaction.id,
        owner: TransactionOwners[transaction.owner],
        ownerId: transaction.ownerId,
        type: TransactionType[transaction.type],
        value: transaction.value,
      });
    },
    async deleteTransaction(params): Promise<void> {
      await datasources.financialTransactionDatasource.deleteTransaction({
        id: params.id,
        ownerId: params.ownerId,
      });

      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
    },
    async getTransactions(ownerIds): Promise<TransactionEntity[]> {
      const cached = cache.get<Array<Record<string, unknown>> | null>(
        CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
      );

      let transactionsModel: TransactionModel[] = [];

      if (cached) {
        transactionsModel = cached.map((cache) =>
          TransactionModel.fromJSON(cache),
        );
      } else {
        transactionsModel =
          await datasources.financialTransactionDatasource.getTransactions(
            ownerIds,
          );
        cache.set<Record<string, unknown>[]>(
          CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
          transactionsModel.map((financial) => financial.toJSON()),
        );
      }

      return transactionsModel.map(
        (transaction) =>
          new TransactionEntity({
            category: transaction.category,
            date: transaction.date,
            description: transaction.description,
            id: transaction.id,
            owner: TransactionOwners[transaction.owner],
            ownerId: transaction.ownerId,
            type: TransactionType[transaction.type],
            value: transaction.value,
          }),
      );
    },
    async updateTransaction(params): Promise<void> {
      await datasources.financialTransactionDatasource.updateTransaction({
        category: params.category,
        date: params.date,
        description: params.description,
        id: params.id,
        owner: params.owner,
        ownerId: params.ownerId,
        type: params.type,
        value: params.value,
      });

      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
    },
  };
}

export default transactionRepositoryImpl;
