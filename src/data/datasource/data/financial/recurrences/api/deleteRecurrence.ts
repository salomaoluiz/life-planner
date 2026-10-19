import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { RecurrenceHasPaidOccurrences } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<RecurrenceDatasource["deleteRecurrence"]>[0];
export type Response = ReturnType<RecurrenceDatasource["deleteRecurrence"]>;

async function deleteRecurrence(params: Params): Response {
  try {
    const data = await api.delete<{ deleted: number; detached: number }>(
      `/v1/finance/recurrences/${params.id}${params.confirmPaid ? "?confirmPaid=true" : ""}`,
    );

    return { deleted: data.deleted, detached: data.detached };
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "RecurrenceDatasource - deleteRecurrence", id: params.id },
      {
        conflict: (details) =>
          new RecurrenceHasPaidOccurrences({
            detachedCount: details.detachedCount ?? 0,
            paidCount: details.paidCount ?? 0,
            paidTotal: details.paidTotal ?? 0,
          }),
        unprocessable: unprocessableError,
      },
    );
  }
}

export default deleteRecurrence;
