import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import TransactionModel from "@data/models/financial/TransactionModel";
import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<
  RecurrenceDatasource["materializeOccurrence"]
>[0];
export type Response = ReturnType<
  RecurrenceDatasource["materializeOccurrence"]
>;

async function materializeOccurrence(params: Params): Response {
  const body = {
    categoryId: params.categoryId,
    date:
      params.date === undefined ? undefined : isoToCalendarDate(params.date),
    description: params.description,
    paid: params.paid,
    scope: "ONLY_THIS",
    tags: params.tags,
    value:
      params.value === undefined
        ? undefined
        : decimalStringToCents(params.value),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      `/v1/finance/recurrences/${params.recurrenceId}/occurrences/${params.occurrenceNumber}?today=${todayCalendarDate()}`,
      body,
    );

    return TransactionModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "RecurrenceDatasource - materializeOccurrence",
        recurrenceId: params.recurrenceId,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default materializeOccurrence;
