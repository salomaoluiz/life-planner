import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import PrepaymentPreviewModel from "@data/models/financial/PrepaymentPreviewModel";
import { OwnerType } from "@data/models/financial/TransactionModel";

export interface InstallmentPlanDatasource {
  createInstallmentPlan(
    params: CreateInstallmentPlanDatasourceParams,
  ): Promise<InstallmentPlanModel>;
  deleteInstallmentPlan(id: string): Promise<void>;
  getInstallmentPlan(id: string): Promise<InstallmentPlanModel>;
  prepayInstallmentPlan(
    params: PrepayInstallmentPlanDatasourceParams,
  ): Promise<InstallmentPlanModel>;
  previewPrepayment(
    params: PreviewPrepaymentDatasourceParams,
  ): Promise<PrepaymentPreviewModel>;
  undoPrepayment(planId: string): Promise<void>;
  updateInstallmentPlan(
    params: UpdateInstallmentPlanDatasourceParams,
  ): Promise<InstallmentPlanModel>;
}

interface CreateInstallmentPlanDatasourceParams {
  categoryId: string;
  creditCardId: string;
  date: string;
  description: string;
  installments: number;
  notes?: null | string;
  owner: OwnerType;
  ownerId: string;
  tags?: string[];
  value: string;
}

interface PrepayInstallmentPlanDatasourceParams {
  // `YYYY-MM-DD`
  date: string;
  // Cents; omitted or 0 = no discount.
  discount?: number;
  planId: string;
  // `YYYY-MM`
  targetInvoiceMonth: string;
}

interface PreviewPrepaymentDatasourceParams {
  planId: string;
  targetInvoiceMonth: string;
}

interface UpdateInstallmentPlanDatasourceParams {
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  installments?: number;
  notes?: null | string;
  // `[]` removes every tag; omitted keeps them (also across a recalculation).
  tags?: string[];
  value?: string;
}

export {
  CreateInstallmentPlanDatasourceParams,
  PrepayInstallmentPlanDatasourceParams,
  PreviewPrepaymentDatasourceParams,
  UpdateInstallmentPlanDatasourceParams,
};
