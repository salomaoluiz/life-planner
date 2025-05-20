import TransactionModel, {
  OwnerType,
  TransactionType,
} from "@data/models/financial/TransactionModel";

export interface TransactionDatasource {
  createTransaction(
    params: CreateTransactionDatasourceParams,
  ): Promise<TransactionModel>;
  deleteTransaction(params: DeleteTransactionDatasourceParams): Promise<void>;
  getTransactions(ownerIds: string[]): Promise<TransactionModel[]>;
  updateTransaction(params: UpdateTransactionDatasourceParams): Promise<void>;
}

interface CreateTransactionDatasourceParams {
  category: string;
  date: string;
  description: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;
}

interface DeleteTransactionDatasourceParams {
  id: string;
  ownerId: string;
}

interface UpdateTransactionDatasourceParams {
  category?: string;
  date?: string;
  description?: string;
  id: string;
  owner?: OwnerType;
  ownerId?: string;
  type?: TransactionType;
  value?: string;
}

export { CreateTransactionDatasourceParams, UpdateTransactionDatasourceParams };
