import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../unprocessableError";

export type Params = Parameters<TransactionDatasource["createTransaction"]>[0];
export type Response = ReturnType<TransactionDatasource["createTransaction"]>;

async function createTransaction(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call. The category name is not
  // stored by the API any more (it is joined from the category), so it is not sent.
  const body = {
    accountId: params.accountId,
    categoryId: params.categoryId,
    creditCardId: params.creditCardId,
    date: isoToCalendarDate(params.date),
    description: params.description,
    notes: params.notes,
    owner: params.owner,
    ownerId: params.ownerId,
    paid: params.paid,
    tags: params.tags,
    type: params.type,
    value: decimalStringToCents(params.value),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      `/v1/finance/transactions?today=${todayCalendarDate()}`,
      body,
    );

    return TransactionModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "TransactionDatasource - createTransaction",
        ownerId: params.ownerId,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default createTransaction;
