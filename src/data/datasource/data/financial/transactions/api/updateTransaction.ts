import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../unprocessableError";

export type Params = Parameters<TransactionDatasource["updateTransaction"]>[0];
export type Response = ReturnType<TransactionDatasource["updateTransaction"]>;

async function updateTransaction(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call. `category` (the name) is not a field.
  const body = {
    accountId: params.accountId,
    categoryId: params.categoryId,
    creditCardId: params.creditCardId,
    date:
      params.date === undefined ? undefined : isoToCalendarDate(params.date),
    description: params.description,
    owner: params.owner,
    ownerId: params.ownerId,
    paid: params.paid,
    scope: params.scope,
    tags: params.tags,
    type: params.type,
    value:
      params.value === undefined
        ? undefined
        : decimalStringToCents(params.value),
  };

  if (Object.values(body).every((value) => value === undefined)) {
    return;
  }

  try {
    await api.patch(
      `/v1/finance/transactions/${params.id}?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "TransactionDatasource - updateTransaction",
        id: params.id,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default updateTransaction;
