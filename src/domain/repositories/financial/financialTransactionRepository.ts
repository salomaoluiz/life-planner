import TransactionEntity, {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";

export type FinancialTransactionRepository = {
  createTransaction(
    params: CreateTransactionRepositoryParams,
  ): Promise<TransactionEntity>;
  deleteTransaction(params: DeleteTransactionRepositoryParams): Promise<void>;
  getTransactions(ownerIds: string[]): Promise<TransactionEntity[]>;
  updateTransaction(params: UpdateTransactionRepositoryParams): Promise<void>;
};

interface CreateTransactionRepositoryParams {
  category: string;
  date: string;
  description: string;
  owner: TransactionOwners;
  ownerId: string;
  type: TransactionType;
  value: string;
}
interface DeleteTransactionRepositoryParams {
  id: string;
  ownerId: string;
}

interface UpdateTransactionRepositoryParams {
  category?: string;
  date?: string;
  description?: string;
  id: string;
  owner?: TransactionOwners;
  ownerId?: string;
  type?: TransactionType;
  value?: string;
}

export { CreateTransactionRepositoryParams, UpdateTransactionRepositoryParams };
