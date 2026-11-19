import { Datasources } from "@data/datasource";
import { FinancialSplitRepository } from "@domain/repositories/financial";

import { invalidateSplitCaches } from "./invalidateSplitCaches";
import { toSplitResult, toSplitUpdateResult } from "./toEntities";

function splitRepositoryImpl(
  datasources: Datasources,
): FinancialSplitRepository {
  return {
    async createSplit(params) {
      const result =
        await datasources.financialSplitDatasource.createSplit(params);

      invalidateSplitCaches();

      return toSplitResult(result);
    },
    async deleteSplit(id) {
      await datasources.financialSplitDatasource.deleteSplit(id);
      invalidateSplitCaches();
    },
    async getSplit(id) {
      return toSplitResult(
        await datasources.financialSplitDatasource.getSplit(id),
      );
    },
    async updateSplit(params) {
      const result =
        await datasources.financialSplitDatasource.updateSplit(params);

      invalidateSplitCaches();

      return toSplitUpdateResult(result);
    },
  };
}

export default splitRepositoryImpl;
