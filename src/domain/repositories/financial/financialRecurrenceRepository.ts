import ProjectedOccurrenceEntity from "@domain/entities/financial/ProjectedOccurrenceEntity";
import RecurrenceEntity, {
  RecurrenceFrequency,
  RecurrenceStatus,
} from "@domain/entities/financial/RecurrenceEntity";
import RecurrenceResultEntity from "@domain/entities/financial/RecurrenceResultEntity";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialRecurrenceRepository = {
  createRecurrence(
    params: CreateRecurrenceRepositoryParams,
  ): Promise<RecurrenceResultEntity>;
  deleteOccurrence(params: DeleteOccurrenceRepositoryParams): Promise<void>;
  deleteRecurrence(
    params: DeleteRecurrenceRepositoryParams,
  ): Promise<DeleteRecurrenceResult>;
  getProjections(
    params: GetProjectionsRepositoryParams,
  ): Promise<ProjectedOccurrenceEntity[]>;
  getRecurrences(
    params: GetRecurrencesRepositoryParams,
  ): Promise<RecurrenceEntity[]>;
  materializeOccurrence(
    params: MaterializeOccurrenceRepositoryParams,
  ): Promise<TransactionEntity>;
  splitRecurrence(
    params: SplitRecurrenceRepositoryParams,
  ): Promise<RecurrenceResultEntity>;
  updateRecurrence(
    params: UpdateRecurrenceRepositoryParams,
  ): Promise<RecurrenceEntity>;
};

interface CreateRecurrenceRepositoryParams {
  accountId?: string;
  categoryId: string;
  creditCardId?: string;
  // ISO date-time of occurrence 1.
  date: string;
  description: string;
  // ISO date-time; omitted = no end date.
  endDate?: string;
  frequency: RecurrenceFrequency;
  owner: OwnerType;
  ownerId: string;
  // Occurrence 1 of an account series only.
  paid?: boolean;
  type: TransactionType;
  value: string;
}

interface DeleteOccurrenceRepositoryParams {
  confirmPaid?: boolean;
  occurrenceNumber: number;
  recurrenceId: string;
  scope: "ONLY_THIS" | "THIS_AND_NEXT";
}

interface DeleteRecurrenceRepositoryParams {
  confirmPaid?: boolean;
  id: string;
}

interface DeleteRecurrenceResult {
  deleted: number;
  detached: number;
}

interface GetProjectionsRepositoryParams {
  // `YYYY-MM`
  from: string;
  ownerIds: string[];
  to: string;
}

interface GetRecurrencesRepositoryParams {
  accountId?: string;
  creditCardId?: string;
  ownerIds?: string[];
  status?: RecurrenceStatus;
}

interface MaterializeOccurrenceRepositoryParams {
  categoryId?: string;
  date?: string;
  description?: string;
  occurrenceNumber: number;
  paid?: boolean;
  recurrenceId: string;
  value?: string;
}

interface SplitRecurrenceRepositoryParams {
  accountId?: string;
  categoryId?: string;
  creditCardId?: string;
  description?: string;
  // `null` removes the end date; omitted keeps it.
  endDate?: null | string;
  frequency?: RecurrenceFrequency;
  occurrenceNumber: number;
  recurrenceId: string;
  value?: string;
}

interface UpdateRecurrenceRepositoryParams {
  categoryId?: string;
  description?: string;
  endDate?: null | string;
  id: string;
  value?: string;
}

export {
  CreateRecurrenceRepositoryParams,
  DeleteOccurrenceRepositoryParams,
  DeleteRecurrenceRepositoryParams,
  DeleteRecurrenceResult,
  GetProjectionsRepositoryParams,
  GetRecurrencesRepositoryParams,
  MaterializeOccurrenceRepositoryParams,
  SplitRecurrenceRepositoryParams,
  UpdateRecurrenceRepositoryParams,
};
