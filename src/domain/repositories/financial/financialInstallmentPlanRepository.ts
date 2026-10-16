import InstallmentPlanEntity from "@domain/entities/financial/InstallmentPlanEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialInstallmentPlanRepository = {
  createInstallmentPlan(
    params: CreateInstallmentPlanRepositoryParams,
  ): Promise<InstallmentPlanEntity>;
  deleteInstallmentPlan(id: string): Promise<void>;
  getInstallmentPlan(id: string): Promise<InstallmentPlanEntity>;
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
  owner: OwnerType;
  ownerId: string;
  // The TOTAL, decimal string.
  value: string;
}

interface UpdateInstallmentPlanRepositoryParams {
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  installments?: number;
  value?: string;
}

export {
  CreateInstallmentPlanRepositoryParams,
  UpdateInstallmentPlanRepositoryParams,
};
