import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import {
  ImportRowEntity,
  ImportValidationEntity,
} from "@domain/entities/financial/TransactionCsv";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface ImportTransactionsUseCaseParams {
  owner: string;
  ownerId: string;
  rows: ImportRowEntity[];
}

// Spec 047 FR 32: writes every checked row or none (`ImportRowsInvalid` carries the rows the API refused).
function importTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<ImportTransactionsUseCaseParams, number> {
  return {
    execute: async (params) => {
      const request = toRequest(params);

      try {
        return await repositories.financialRepository.transaction.importTransactions(
          request,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.importTransactionsUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.import_transactions_use_case",
  };
}

function toRequest(params: ImportTransactionsUseCaseParams) {
  const owner = OwnerType[params.owner as keyof typeof OwnerType];

  if (!owner) {
    throw new FieldInvalid({ owner });
  }

  return { owner, ownerId: params.ownerId, rows: params.rows };
}

// Spec 047 FR 27: the dry run. Nothing is written; the API answers the row errors and the possible duplicates.
function validateImportUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ImportTransactionsUseCaseParams,
  ImportValidationEntity
> {
  return {
    execute: async (params) => {
      const request = toRequest(params);

      try {
        return await repositories.financialRepository.transaction.validateImport(
          request,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.validateImportUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.validate_import_use_case",
  };
}

export { importTransactionsUseCase, validateImportUseCase };
