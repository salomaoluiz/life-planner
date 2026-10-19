import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { RecurrenceHasPaidOccurrences } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<RecurrenceDatasource["deleteOccurrence"]>[0];
export type Response = ReturnType<RecurrenceDatasource["deleteOccurrence"]>;

async function deleteOccurrence(params: Params): Response {
  const query = new URLSearchParams({
    scope: params.scope,
    today: todayCalendarDate(),
  });

  if (params.confirmPaid) {
    query.set("confirmPaid", "true");
  }

  try {
    await api.delete(
      `/v1/finance/recurrences/${params.recurrenceId}/occurrences/${params.occurrenceNumber}?${query.toString()}`,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "RecurrenceDatasource - deleteOccurrence",
        recurrenceId: params.recurrenceId,
      },
      {
        conflict: (details) =>
          new RecurrenceHasPaidOccurrences(toCounts(details)),
        unprocessable: unprocessableError,
      },
    );
  }
}

function toCounts(details: Record<string, number>) {
  return {
    detachedCount: details.detachedCount ?? 0,
    paidCount: details.paidCount ?? 0,
    paidTotal: details.paidTotal ?? 0,
  };
}

export default deleteOccurrence;
