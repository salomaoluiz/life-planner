import TransactionModel, {
  OwnerType,
  TransactionType,
} from "@data/models/financial/TransactionModel";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import {
  ExportFileEntity,
  ExportQuery,
  ExportRequest,
  ImportRequest,
  ImportValidationEntity,
} from "@domain/entities/financial/TransactionCsv";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";

export interface TransactionDatasource {
  createTransaction(
    params: CreateTransactionDatasourceParams,
  ): Promise<TransactionModel>;
  deleteTransaction(params: DeleteTransactionDatasourceParams): Promise<void>;
  exportTransactions(params: ExportRequest): Promise<ExportFileEntity>;
  getExportCount(params: ExportQuery): Promise<number>;
  getFilteredTransactions(
    params: GetFilteredTransactionsDatasourceParams,
  ): Promise<TransactionModel[]>;
  getTransactions(ownerIds: string[]): Promise<TransactionModel[]>;
  importTransactions(params: ImportRequest): Promise<number>;
  updateTransaction(params: UpdateTransactionDatasourceParams): Promise<void>;
  validateImport(params: ImportRequest): Promise<ImportValidationEntity>;
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
  // Spec 043: tag names, resolved (or created) by the API in the owner.
  tags?: string[];
  type: TransactionType;
  value: string;
}

interface DeleteTransactionDatasourceParams {
  id: string;
  ownerId: string;
  scope?: InstallmentScope;
}

interface GetFilteredTransactionsDatasourceParams {
  filter: TransactionQueryFilter;
  ownerIds: string[];
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
  // `[]` removes every tag; omitted leaves them.
  tags?: string[];
  type?: TransactionType;
  value?: string;
}

export { CreateTransactionDatasourceParams, UpdateTransactionDatasourceParams };
