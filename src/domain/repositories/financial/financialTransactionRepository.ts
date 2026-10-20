import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
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
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  owner: OwnerType;
  ownerId: string;
  // Account rows only; omitted → the API decides from the date (spec 033).
  paid?: boolean;
  // Spec 043: tag names, resolved (or created) by the API in the owner.
  tags?: string[];
  type: TransactionType;
  value: string;
}
interface DeleteTransactionRepositoryParams {
  id: string;
  ownerId: string;
  // Required by the API on a recurring occurrence (spec 034 FR 29).
  scope?: InstallmentScope;
}

interface UpdateTransactionRepositoryParams {
  accountId?: string;
  category?: string;
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  owner?: OwnerType;
  ownerId?: string;
  paid?: boolean;
  scope?: InstallmentScope;
  // `[]` removes every tag; omitted leaves them.
  tags?: string[];
  type?: TransactionType;
  value?: string;
}

export { CreateTransactionRepositoryParams, UpdateTransactionRepositoryParams };
