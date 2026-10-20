import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import RecurrenceModel from "@data/models/financial/RecurrenceModel";
import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<RecurrenceDatasource["updateRecurrence"]>[0];
export type Response = ReturnType<RecurrenceDatasource["updateRecurrence"]>;

async function updateRecurrence(params: Params): Response {
  // Only the sent fields reach the API; `endDate: null` removes the end date.
  const body = {
    categoryId: params.categoryId,
    description: params.description,
    endDate:
      params.endDate === undefined || params.endDate === null
        ? params.endDate
        : isoToCalendarDate(params.endDate),
    tags: params.tags,
    value:
      params.value === undefined
        ? undefined
        : decimalStringToCents(params.value),
  };

  try {
    const data = await api.patch<Record<string, unknown>>(
      `/v1/finance/recurrences/${params.id}?today=${todayCalendarDate()}`,
      body,
    );

    return RecurrenceModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "RecurrenceDatasource - updateRecurrence", id: params.id },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default updateRecurrence;
