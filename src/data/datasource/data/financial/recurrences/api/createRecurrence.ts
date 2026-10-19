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

export type Params = Parameters<RecurrenceDatasource["createRecurrence"]>[0];
export type Response = ReturnType<RecurrenceDatasource["createRecurrence"]>;

async function createRecurrence(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call.
  const body = {
    accountId: params.accountId,
    categoryId: params.categoryId,
    creditCardId: params.creditCardId,
    date: isoToCalendarDate(params.date),
    description: params.description,
    endDate:
      params.endDate === undefined
        ? undefined
        : isoToCalendarDate(params.endDate),
    frequency: params.frequency,
    owner: params.owner,
    ownerId: params.ownerId,
    paid: params.paid,
    type: params.type,
    value: decimalStringToCents(params.value),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      `/v1/finance/recurrences?today=${todayCalendarDate()}`,
      body,
    );

    return {
      occurrences: (data.occurrences as Record<string, unknown>[]).map((row) =>
        TransactionModel.fromJSON(row),
      ),
      overLimit: data.overLimit === true,
      recurrence: RecurrenceModel.fromJSON(
        data.recurrence as Record<string, unknown>,
      ),
    };
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "RecurrenceDatasource - createRecurrence",
        ownerId: params.ownerId,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default createRecurrence;
