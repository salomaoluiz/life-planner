import { isoToCalendarDate } from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TransactionDatasource["createTransaction"]>[0];
export type Response = ReturnType<TransactionDatasource["createTransaction"]>;

async function createTransaction(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call. The category name is not
  // stored by the API any more (it is joined from the category), so it is not sent.
  const body = {
    accountId: params.accountId,
    categoryId: params.categoryId,
    date: isoToCalendarDate(params.date),
    description: params.description,
    owner: params.owner,
    ownerId: params.ownerId,
    type: params.type,
    value: decimalStringToCents(params.value),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      "/v1/finance/transactions",
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
      { fields: body },
    );
  }
}

export default createTransaction;
