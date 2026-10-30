import InstallmentPlanEntity from "@domain/entities/financial/InstallmentPlanEntity";
import PrepaymentPreviewEntity from "@domain/entities/financial/PrepaymentPreviewEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialInstallmentPlanRepository = {
  createInstallmentPlan(
    params: CreateInstallmentPlanRepositoryParams,
  ): Promise<InstallmentPlanEntity>;
  deleteInstallmentPlan(id: string): Promise<void>;
  getInstallmentPlan(id: string): Promise<InstallmentPlanEntity>;
  prepayInstallmentPlan(
    params: PrepayInstallmentPlanRepositoryParams,
  ): Promise<InstallmentPlanEntity>;
  previewPrepayment(
    params: PreviewPrepaymentRepositoryParams,
  ): Promise<PrepaymentPreviewEntity>;
  undoPrepayment(planId: string): Promise<void>;
  updateInstallmentPlan(
    params: UpdateInstallmentPlanRepositoryParams,
  ): Promise<InstallmentPlanEntity>;
};

interface CreateInstallmentPlanRepositoryParams {
  categoryId: string;
  creditCardId: string;
  // ISO date-time of the purchase day.
  date: string;
  description: string;
  installments: number;
  notes?: null | string;
  owner: OwnerType;
  ownerId: string;
  tags?: string[];
  // The TOTAL, decimal string.
  value: string;
}

interface PrepayInstallmentPlanRepositoryParams {
  // `YYYY-MM-DD`
  date: string;
  // Cents; omitted or 0 = no discount.
  discount?: number;
  planId: string;
  // `YYYY-MM`
  targetInvoiceMonth: string;
}

interface PreviewPrepaymentRepositoryParams {
  planId: string;
  targetInvoiceMonth: string;
}

interface UpdateInstallmentPlanRepositoryParams {
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  installments?: number;
  notes?: null | string;
  tags?: string[];
  value?: string;
}

export {
  CreateInstallmentPlanRepositoryParams,
  PrepayInstallmentPlanRepositoryParams,
  PreviewPrepaymentRepositoryParams,
  UpdateInstallmentPlanRepositoryParams,
};
