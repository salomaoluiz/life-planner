import { todayCalendarDate } from "@data/models/financial/calendarDate";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { ApiBusinessError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TransactionDatasource["getTransactionById"]>[0];
export type Response = ReturnType<TransactionDatasource["getTransactionById"]>;

// Spec 077: one row for the edit forms. `today` lets the API derive the paid status of a card purchase.
async function getTransactionById(id: Params): Response {
  try {
    const transaction = await api.get<Record<string, unknown>>(
      `/v1/finance/transactions/${id}?today=${todayCalendarDate()}`,
    );

    return TransactionModel.fromJSON(transaction);
  } catch (error) {
    // Missing, or a row the user cannot read (the API does not tell them apart).
    if (error instanceof ApiBusinessError && error.statusCode === 404) {
      return undefined;
    }

    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getTransactionById",
      id,
    });
  }
}

export default getTransactionById;
