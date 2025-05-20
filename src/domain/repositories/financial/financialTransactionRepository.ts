import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

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
  owner: OwnerType;
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
  owner?: OwnerType;
  ownerId?: string;
  type?: TransactionType;
  value?: string;
}

export { CreateTransactionRepositoryParams, UpdateTransactionRepositoryParams };
