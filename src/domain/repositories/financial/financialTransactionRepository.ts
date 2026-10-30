import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import {
  ExportFileEntity,
  ExportQuery,
  ExportRequest,
  ImportRequest,
  ImportValidationEntity,
} from "@domain/entities/financial/TransactionCsv";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialTransactionRepository = {
  createTransaction(
    params: CreateTransactionRepositoryParams,
  ): Promise<TransactionEntity>;
  deleteTransaction(params: DeleteTransactionRepositoryParams): Promise<void>;
  // Spec 047: the CSV of a period and scope.
  exportTransactions(params: ExportRequest): Promise<ExportFileEntity>;
  // Spec 047: how many rows an export of the query would write.
  getExportCount(params: ExportQuery): Promise<number>;
  // Spec 045: account rows that match the filters (no cache).
  getFilteredTransactions(
    params: GetFilteredTransactionsRepositoryParams,
  ): Promise<TransactionEntity[]>;
  getTransactions(ownerIds: string[]): Promise<TransactionEntity[]>;
  // Spec 047: writes every row or none; a 422 throws `ImportRowsInvalid`.
  importTransactions(params: ImportRequest): Promise<number>;
  updateTransaction(params: UpdateTransactionRepositoryParams): Promise<void>;
  // Spec 047: dry run, nothing is written.
  validateImport(params: ImportRequest): Promise<ImportValidationEntity>;
};

interface CreateTransactionRepositoryParams {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  notes?: null | string;
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
interface GetFilteredTransactionsRepositoryParams {
  filter: TransactionQueryFilter;
  ownerIds: string[];
}

interface UpdateTransactionRepositoryParams {
  accountId?: string;
  category?: string;
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  notes?: null | string;
  owner?: OwnerType;
  ownerId?: string;
  paid?: boolean;
  scope?: InstallmentScope;
  // `[]` removes every tag; omitted leaves them.
  tags?: string[];
  type?: TransactionType;
  value?: string;
}

export {
  CreateTransactionRepositoryParams,
  GetFilteredTransactionsRepositoryParams,
  UpdateTransactionRepositoryParams,
};
