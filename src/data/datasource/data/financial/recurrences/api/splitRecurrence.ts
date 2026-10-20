import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import RecurrenceModel from "@data/models/financial/RecurrenceModel";
import TransactionModel from "@data/models/financial/TransactionModel";
import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<RecurrenceDatasource["splitRecurrence"]>[0];
export type Response = ReturnType<RecurrenceDatasource["splitRecurrence"]>;

async function splitRecurrence(params: Params): Response {
  const body = {
    accountId: params.accountId,
    categoryId: params.categoryId,
    creditCardId: params.creditCardId,
    description: params.description,
    endDate:
      params.endDate === undefined || params.endDate === null
        ? params.endDate
        : isoToCalendarDate(params.endDate),
    frequency: params.frequency,
    occurrenceNumber: params.occurrenceNumber,
    tags: params.tags,
    value:
      params.value === undefined
        ? undefined
        : decimalStringToCents(params.value),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      `/v1/finance/recurrences/${params.recurrenceId}/split?today=${todayCalendarDate()}`,
      body,
    );

    return {
      ended: data.ended
        ? RecurrenceModel.fromJSON(data.ended as Record<string, unknown>)
        : undefined,
      occurrences: (data.occurrences as Record<string, unknown>[]).map((row) =>
        TransactionModel.fromJSON(row),
      ),
      overLimit: false,
      recurrence: RecurrenceModel.fromJSON(
        data.recurrence as Record<string, unknown>,
      ),
    };
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "RecurrenceDatasource - splitRecurrence",
        recurrenceId: params.recurrenceId,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default splitRecurrence;
