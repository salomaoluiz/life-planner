import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import { OwnerType } from "@data/models/financial/TransactionModel";

export interface InstallmentPlanDatasource {
  createInstallmentPlan(
    params: CreateInstallmentPlanDatasourceParams,
  ): Promise<InstallmentPlanModel>;
  deleteInstallmentPlan(id: string): Promise<void>;
  getInstallmentPlan(id: string): Promise<InstallmentPlanModel>;
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
  owner: OwnerType;
  ownerId: string;
  value: string;
}

interface UpdateInstallmentPlanDatasourceParams {
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  installments?: number;
  value?: string;
}

export {
  CreateInstallmentPlanDatasourceParams,
  UpdateInstallmentPlanDatasourceParams,
};
