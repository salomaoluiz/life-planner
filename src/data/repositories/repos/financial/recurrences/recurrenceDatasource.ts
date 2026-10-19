import ProjectedOccurrenceModel from "@data/models/financial/ProjectedOccurrenceModel";
import RecurrenceModel from "@data/models/financial/RecurrenceModel";
import TransactionModel, {
  OwnerType,
  RecurrenceFrequency,
  TransactionType,
} from "@data/models/financial/TransactionModel";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";

export interface CreateRecurrenceDatasourceParams {
  accountId?: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  endDate?: string;
  frequency: RecurrenceFrequency;
  owner: OwnerType;
  ownerId: string;
  paid?: boolean;
  type: TransactionType;
  value: string;
}

export interface DeleteOccurrenceDatasourceParams {
  confirmPaid?: boolean;
  occurrenceNumber: number;
  recurrenceId: string;
  scope: InstallmentScope;
}

export interface DeleteRecurrenceDatasourceParams {
  confirmPaid?: boolean;
  id: string;
}

export interface GetProjectionsDatasourceParams {
  from: string;
  ownerIds: string[];
  to: string;
}

export interface GetRecurrencesDatasourceParams {
  accountId?: string;
  creditCardId?: string;
  ownerIds?: string[];
  status?: "ACTIVE" | "ENDED";
}

export interface MaterializeOccurrenceDatasourceParams {
  categoryId?: string;
  date?: string;
  description?: string;
  occurrenceNumber: number;
  paid?: boolean;
  recurrenceId: string;
  value?: string;
}

export interface RecurrenceDatasource {
  createRecurrence(
    params: CreateRecurrenceDatasourceParams,
  ): Promise<RecurrenceResultModel>;
  deleteOccurrence(params: DeleteOccurrenceDatasourceParams): Promise<void>;
  deleteRecurrence(
    params: DeleteRecurrenceDatasourceParams,
  ): Promise<{ deleted: number; detached: number }>;
  getProjections(
    params: GetProjectionsDatasourceParams,
  ): Promise<ProjectedOccurrenceModel[]>;
  getRecurrences(
    params: GetRecurrencesDatasourceParams,
  ): Promise<RecurrenceModel[]>;
  materializeOccurrence(
    params: MaterializeOccurrenceDatasourceParams,
  ): Promise<TransactionModel>;
  splitRecurrence(
    params: SplitRecurrenceDatasourceParams,
  ): Promise<RecurrenceResultModel>;
  updateRecurrence(
    params: UpdateRecurrenceDatasourceParams,
  ): Promise<RecurrenceModel>;
}

export interface RecurrenceResultModel {
  ended?: RecurrenceModel;
  occurrences: TransactionModel[];
  overLimit: boolean;
  recurrence: RecurrenceModel;
}

export interface SplitRecurrenceDatasourceParams {
  accountId?: string;
  categoryId?: string;
  creditCardId?: string;
  description?: string;
  endDate?: null | string;
  frequency?: RecurrenceFrequency;
  occurrenceNumber: number;
  recurrenceId: string;
  value?: string;
}

export interface UpdateRecurrenceDatasourceParams {
  categoryId?: string;
  description?: string;
  endDate?: null | string;
  id: string;
  value?: string;
}
