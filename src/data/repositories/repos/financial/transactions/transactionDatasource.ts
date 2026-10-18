import TransactionModel, {
  OwnerType,
  TransactionType,
} from "@data/models/financial/TransactionModel";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";

export interface TransactionDatasource {
  createTransaction(
    params: CreateTransactionDatasourceParams,
  ): Promise<TransactionModel>;
  deleteTransaction(params: DeleteTransactionDatasourceParams): Promise<void>;
  getTransactions(ownerIds: string[]): Promise<TransactionModel[]>;
  updateTransaction(params: UpdateTransactionDatasourceParams): Promise<void>;
}

interface CreateTransactionDatasourceParams {
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
  type: TransactionType;
  value: string;
}

interface DeleteTransactionDatasourceParams {
  id: string;
  ownerId: string;
}

interface UpdateTransactionDatasourceParams {
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
  // Required by the API when the transaction is an installment (spec 030).
  scope?: InstallmentScope;
  type?: TransactionType;
  value?: string;
}

export { CreateTransactionDatasourceParams, UpdateTransactionDatasourceParams };
