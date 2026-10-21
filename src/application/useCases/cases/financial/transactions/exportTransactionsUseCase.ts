import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import {
  ExportFileEntity,
  ExportRequest,
} from "@domain/entities/financial/TransactionCsv";
import Repositories from "@domain/repositories";

// Spec 047 FR 3: the CSV text of the export; saving or sharing it is the screen's job.
function exportTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<ExportRequest, ExportFileEntity> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.transaction.exportTransactions(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.exportTransactionsUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.export_transactions_use_case",
  };
}

export default exportTransactionsUseCase;
