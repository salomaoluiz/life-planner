import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { ApiBusinessError, ImportRowsInvalid } from "@domain/entities/errors";
import { ImportRowErrorEntity } from "@domain/entities/financial/TransactionCsv";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TransactionDatasource["importTransactions"]>[0];
export type Response = ReturnType<TransactionDatasource["importTransactions"]>;

// ... and the real run (201 `{ created }`): all rows or none.
async function importTransactions(params: Params): Response {
  try {
    const data = await api.post<{ created: number }>(path(), {
      ...params,
      dryRun: false,
    });

    return data.created;
  } catch (error) {
    const errors = rowErrorsOf(error);

    if (errors) {
      throw new ImportRowsInvalid(errors);
    }

    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - importTransactions",
    });
  }
}

function path(): string {
  return `/v1/finance/transactions/import?today=${todayCalendarDate()}`;
}

// A 422 that carries `errors` is the API refusing rows, not a failure of the call.
function rowErrorsOf(error: unknown): ImportRowErrorEntity[] | undefined {
  if (error instanceof ApiBusinessError && error.statusCode === 422) {
    const { errors } = error.body;

    return Array.isArray(errors)
      ? (errors as ImportRowErrorEntity[])
      : undefined;
  }

  return undefined;
}

// Spec 047 §7: a dry run (200 `{ errors, duplicates }`, nothing written) ...
async function validateImport(
  params: Params,
): ReturnType<TransactionDatasource["validateImport"]> {
  try {
    const data = await api.post<{
      duplicates: number[];
      errors: ImportRowErrorEntity[];
    }>(path(), { ...params, dryRun: true });

    return { duplicates: data.duplicates, errors: data.errors };
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - validateImport",
    });
  }
}

export { importTransactions, validateImport };
