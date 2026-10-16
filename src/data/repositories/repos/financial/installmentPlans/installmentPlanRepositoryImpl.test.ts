import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import { apiInstallmentPlan } from "@data/models/financial/mocks/InstallmentPlan.mocks";
import InstallmentPlanEntity from "@domain/entities/financial/InstallmentPlanEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import installmentPlanRepositoryImpl from "./installmentPlanRepositoryImpl";

const datasource = jest.mocked(
  datasourcesMocks.financialInstallmentPlanDatasource,
);
const repository = installmentPlanRepositoryImpl(datasourcesMocks);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(cache, "invalidate").mockImplementation(() => undefined);
});

it("SHOULD create a plan, return the entity AND invalidate the transaction and account caches", async () => {
  datasource.createInstallmentPlan.mockResolvedValueOnce(
    InstallmentPlanModel.fromJSON(apiInstallmentPlan),
  );

  const result = await repository.createInstallmentPlan({
    categoryId: "category-1",
    creditCardId: "card-1",
    date: new Date(2026, 9, 20).toISOString(),
    description: "Notebook",
    installments: 2,
    owner: OwnerType.USER,
    ownerId: "user-id",
    value: "66.67",
  });

  expect(result).toBeInstanceOf(InstallmentPlanEntity);
  expect(result.owner).toBe(OwnerType.USER);
  expect(result.installments).toHaveLength(2);
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
});

it("SHOULD read a plan WITHOUT touching the caches", async () => {
  datasource.getInstallmentPlan.mockResolvedValueOnce(
    InstallmentPlanModel.fromJSON(apiInstallmentPlan),
  );

  expect((await repository.getInstallmentPlan("plan-1")).id).toBe("plan-1");
  expect(cache.invalidate).not.toHaveBeenCalled();
});

it("SHOULD update and delete a plan AND invalidate the caches", async () => {
  datasource.updateInstallmentPlan.mockResolvedValueOnce(
    InstallmentPlanModel.fromJSON(apiInstallmentPlan),
  );

  await repository.updateInstallmentPlan({ description: "x", id: "plan-1" });
  await repository.deleteInstallmentPlan("plan-1");

  expect(datasource.deleteInstallmentPlan).toHaveBeenCalledWith("plan-1");
  expect(cache.invalidate).toHaveBeenCalledTimes(4);
});
