import { Datasources } from "@data/datasource";
import TransactionModel from "@data/models/financial/TransactionModel";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["getTransactions"]
>[0];

async function getTransactions(ownerIds: Params, datasources: Datasources) {
  const cached = cache.get<Array<Record<string, unknown>> | null>(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );

  let transactionsModel: TransactionModel[] = [];

  if (cached) {
    transactionsModel = cached.map((cache) => TransactionModel.fromJSON(cache));
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
        owner: OwnerType[transaction.owner],
        ownerId: transaction.ownerId,
        type: TransactionType[transaction.type],
        value: transaction.value,
      }),
  );
}

export default getTransactions;
