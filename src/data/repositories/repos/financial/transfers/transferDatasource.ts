import TransactionModel from "@data/models/financial/TransactionModel";
import TransferModel from "@data/models/financial/TransferModel";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";

export interface TransferDatasource {
  createTransfer(
    params: CreateTransferDatasourceParams,
  ): Promise<TransferResultModel>;
  deleteTransfer(params: DeleteTransferDatasourceParams): Promise<void>;
  getTransfer(id: string): Promise<TransferResultModel>;
  updateTransfer(
    params: UpdateTransferDatasourceParams,
  ): Promise<TransferResultModel>;
}

export interface TransferResultModel {
  rows: TransactionModel[];
  transfer: TransferModel;
}

interface CreateTransferDatasourceParams {
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

interface DeleteTransferDatasourceParams {
  id: string;
  scope?: InstallmentScope;
}

interface UpdateTransferDatasourceParams {
  amountIn?: string;
  amountOut?: string;
  dateIn?: string;
  dateOut?: string;
  description?: string;
  // `null` removes the fee.
  fee?: null | string;
  fromAccountId?: string;
  id: string;
  notes?: null | string;
  paid?: boolean;
  scope?: InstallmentScope;
  toAccountId?: string;
}

export type {
  CreateTransferDatasourceParams,
  DeleteTransferDatasourceParams,
  UpdateTransferDatasourceParams,
};
