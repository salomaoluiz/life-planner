import { Datasources } from "@data/datasource";
import { FinancialTransferRepository } from "@domain/repositories/financial";

import createTransfer from "./createTransfer";
import deleteTransfer from "./deleteTransfer";
import { toTransferResult } from "./toEntities";
import updateTransfer from "./updateTransfer";

function transferRepositoryImpl(
  datasources: Datasources,
): FinancialTransferRepository {
  return {
    async createTransfer(params) {
      return createTransfer(params, datasources);
    },
    async deleteTransfer(params) {
      return deleteTransfer(params, datasources);
    },
    async getTransfer(id) {
      return toTransferResult(
        await datasources.financialTransferDatasource.getTransfer(id),
      );
    },
    async updateTransfer(params) {
      return updateTransfer(params, datasources);
    },
  };
}

export default transferRepositoryImpl;
