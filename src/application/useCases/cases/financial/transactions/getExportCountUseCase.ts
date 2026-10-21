import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ExportQuery } from "@domain/entities/financial/TransactionCsv";
import Repositories from "@domain/repositories";

// Spec 047 FR 2: how many transactions the export of this period, scope and accounts would write.
function getExportCountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<ExportQuery, number> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.transaction.getExportCount(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getExportCountUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.get_export_count_use_case",
  };
}

export default getExportCountUseCase;
