import SplitEntity, {
  SplitResultEntity,
  SplitUpdateResultEntity,
} from "@domain/entities/financial/SplitEntity";

export type FinancialSplitRepository = {
  createSplit(params: CreateSplitRepositoryParams): Promise<SplitResultEntity>;
  deleteSplit(id: string): Promise<void>;
  getSplit(id: string): Promise<SplitResultEntity>;
  updateSplit(
    params: UpdateSplitRepositoryParams,
  ): Promise<SplitUpdateResultEntity>;
};

// A part as the form writes it: `value` is decimal text (negative only for the "Desconto/ajuste" part);
// `description` null inherits the description of the split; `id` keeps a stored part.
export interface SplitPartRepositoryParams {
  categoryId?: string;
  description?: null | string;
  id?: string;
  systemKey?: "SPLIT_ADJUSTMENT";
  tags?: string[];
  type: "EXPENSE" | "INCOME";
  value: string;
}

interface CreateSplitRepositoryParams {
  accountId?: string;
  creditCardId?: string;
  date: string;
  description: string;
  fromTransactionId?: string;
  invoiceMonth?: string;
  notes?: null | string;
  paid?: boolean;
  parts: SplitPartRepositoryParams[];
  total?: string;
}

interface UpdateSplitRepositoryParams {
  accountId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  invoiceMonth?: string;
  notes?: null | string;
  paid?: boolean;
  parts?: SplitPartRepositoryParams[];
  total?: string;
}

export type {
  CreateSplitRepositoryParams,
  SplitEntity,
  UpdateSplitRepositoryParams,
};
