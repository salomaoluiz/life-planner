import FinanceMonthEntity from "@domain/entities/financial/FinanceMonthEntity";
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
import {
  TransactionDateRange,
  TransactionQueryFilter,
  TransactionReadOptions,
} from "@domain/entities/financial/TransactionQueryFilter";
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
  // Spec 080: rows, invoices, balances, projections and summary of one month in one request (no cache).
  getFinanceMonth(params: {
    month: string;
    ownerIds: string[];
  }): Promise<FinanceMonthEntity>;
  // Spec 077: one row; `undefined` when it is missing or not readable.
  getTransactionById(id: string): Promise<TransactionEntity | undefined>;
  // Only the given period (spec 078: the API needs one), never persisted.
  getTransactions(
    ownerIds: string[],
    range: TransactionDateRange,
    options?: TransactionReadOptions,
  ): Promise<TransactionEntity[]>;
  // Spec 077: any transaction of the category in the last two years (account rows or card purchases).
  hasCategoryTransactions(
    ownerIds: string[],
    categoryId: string,
  ): Promise<boolean>;
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
  // Spec 095: card purchases only; omitted = the invoice of the date.
  invoiceMonth?: string;
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
  // Spec 095: the invoice of a card purchase (installment rows with `scope`); omitted = unchanged.
  invoiceMonth?: string;
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
