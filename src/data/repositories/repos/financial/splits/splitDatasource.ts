import SplitModel from "@data/models/financial/SplitModel";
import TransactionModel from "@data/models/financial/TransactionModel";

export interface SplitDatasource {
  createSplit(params: CreateSplitDatasourceParams): Promise<SplitResultModel>;
  deleteSplit(id: string): Promise<void>;
  getSplit(id: string): Promise<SplitResultModel>;
  updateSplit(
    params: UpdateSplitDatasourceParams,
  ): Promise<SplitUpdateResultModel>;
}

// A part as the form writes it: `value` is decimal text (negative only for the adjustment); `description` null inherits
// the description of the split; `id` keeps a stored part.
export interface SplitPartParams {
  categoryId?: string;
  description?: null | string;
  id?: string;
  systemKey?: "SPLIT_ADJUSTMENT";
  tags?: string[];
  type: "EXPENSE" | "INCOME";
  value: string;
}

export interface SplitResultModel {
  parts: TransactionModel[];
  split: SplitModel;
}

export interface SplitUpdateResultModel {
  dissolved?: TransactionModel;
  result?: SplitResultModel;
}

interface CreateSplitDatasourceParams {
  accountId?: string;
  creditCardId?: string;
  date: string;
  description: string;
  // Converts a saved transaction: it becomes the first part.
  fromTransactionId?: string;
  invoiceMonth?: string;
  notes?: null | string;
  paid?: boolean;
  parts: SplitPartParams[];
  // The receipt total typed by the user (decimal text); the net of the parts must equal it.
  total?: string;
}

interface UpdateSplitDatasourceParams {
  accountId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  invoiceMonth?: string;
  notes?: null | string;
  paid?: boolean;
  parts?: SplitPartParams[];
  total?: string;
}

export type { CreateSplitDatasourceParams, UpdateSplitDatasourceParams };
