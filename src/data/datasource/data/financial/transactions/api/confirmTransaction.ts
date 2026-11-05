import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { TransactionNotProjected } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../unprocessableError";

export type Params = Parameters<TransactionDatasource["confirmTransaction"]>[0];
export type Response = ReturnType<TransactionDatasource["confirmTransaction"]>;

// Spec 096 FR 4: the real charge of a projected card purchase (value and date are the actual ones).
async function confirmTransaction(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call.
  const body = {
    date: isoToCalendarDate(params.date),
    invoiceMonth: params.invoiceMonth,
    value: decimalStringToCents(params.value),
  };

  try {
    await api.post(
      `/v1/finance/transactions/${params.id}/confirm?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "TransactionDatasource - confirmTransaction",
        id: params.id,
        ownerId: params.ownerId,
      },
      {
        conflict: () => new TransactionNotProjected(),
        fields: body,
        unprocessable: unprocessableError,
      },
    );
  }
}

export default confirmTransaction;
