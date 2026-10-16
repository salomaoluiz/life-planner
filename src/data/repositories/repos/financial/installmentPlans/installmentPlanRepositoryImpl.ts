import { Datasources } from "@data/datasource";
import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import InstallmentPlanEntity from "@domain/entities/financial/InstallmentPlanEntity";
import PrepaymentPreviewEntity from "@domain/entities/financial/PrepaymentPreviewEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialInstallmentPlanRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function installmentPlanRepositoryImpl(
  datasources: Datasources,
): FinancialInstallmentPlanRepository {
  function datasource() {
    return datasources.financialInstallmentPlanDatasource;
  }

  return {
    async createInstallmentPlan(params): Promise<InstallmentPlanEntity> {
      const model = await datasource().createInstallmentPlan(params);

      invalidateFinancialCaches();

      return toInstallmentPlanEntity(model);
    },
    async deleteInstallmentPlan(id): Promise<void> {
      await datasource().deleteInstallmentPlan(id);
      invalidateFinancialCaches();
    },
    async getInstallmentPlan(id): Promise<InstallmentPlanEntity> {
      return toInstallmentPlanEntity(await datasource().getInstallmentPlan(id));
    },
    async prepayInstallmentPlan(params): Promise<InstallmentPlanEntity> {
      const model = await datasource().prepayInstallmentPlan(params);

      invalidateFinancialCaches();

      return toInstallmentPlanEntity(model);
    },
    async previewPrepayment(params): Promise<PrepaymentPreviewEntity> {
      const model = await datasource().previewPrepayment(params);

      return new PrepaymentPreviewEntity({
        eligible: model.eligible.map((row) => ({ ...row })),
        total: model.total,
      });
    },
    async undoPrepayment(planId): Promise<void> {
      await datasource().undoPrepayment(planId);
      invalidateFinancialCaches();
    },
    async updateInstallmentPlan(params): Promise<InstallmentPlanEntity> {
      const model = await datasource().updateInstallmentPlan(params);

      invalidateFinancialCaches();

      return toInstallmentPlanEntity(model);
    },
  };
}

// Plan writes change card purchases (the transactions list) and, through them, what the cards owe.
function invalidateFinancialCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

function toInstallmentPlanEntity(
  model: InstallmentPlanModel,
): InstallmentPlanEntity {
  return new InstallmentPlanEntity({
    categoryId: model.categoryId,
    creditCardId: model.creditCardId,
    date: model.date,
    description: model.description,
    id: model.id,
    installmentCount: model.installmentCount,
    installments: model.installments.map((row) => ({ ...row })),
    overLimit: model.overLimit,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
    prepayment: model.prepayment ? { ...model.prepayment } : undefined,
    totalValue: model.totalValue,
  });
}

export default installmentPlanRepositoryImpl;
export { toInstallmentPlanEntity };
