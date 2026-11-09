import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import TransactionEntity from "@domain/entities/financial/TransactionEntity";
import TransferEntity from "@domain/entities/financial/TransferEntity";

export type FinancialTransferRepository = {
  createTransfer(
    params: CreateTransferRepositoryParams,
  ): Promise<TransferResultEntity>;
  deleteTransfer(params: DeleteTransferRepositoryParams): Promise<void>;
  getTransfer(id: string): Promise<TransferResultEntity>;
  updateTransfer(
    params: UpdateTransferRepositoryParams,
  ): Promise<TransferResultEntity>;
};

// The transfer and the rows it wrote (out, in and fee), already joined with their lookups.
export interface TransferResultEntity {
  rows: TransactionEntity[];
  transfer: TransferEntity;
}

interface CreateTransferRepositoryParams {
  amountIn?: string;
  amountOut: string;
  dateIn?: string;
  dateOut: string;
  description: string;
  fee?: string;
  fromAccountId: string;
  notes?: null | string;
  paid: boolean;
  recurrence?: { endDate?: string; frequency: RecurrenceFrequency };
  toAccountId: string;
}

interface DeleteTransferRepositoryParams {
  id: string;
  scope?: InstallmentScope;
}

interface UpdateTransferRepositoryParams {
  amountIn?: string;
  amountOut?: string;
  dateIn?: string;
  dateOut?: string;
  description?: string;
  fee?: null | string;
  fromAccountId?: string;
  id: string;
  notes?: null | string;
  paid?: boolean;
  scope?: InstallmentScope;
  toAccountId?: string;
}

export type {
  CreateTransferRepositoryParams,
  DeleteTransferRepositoryParams,
  UpdateTransferRepositoryParams,
};
