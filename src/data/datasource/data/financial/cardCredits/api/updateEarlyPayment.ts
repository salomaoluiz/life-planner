import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CardCreditDatasource } from "@data/repositories/repos/financial/cardCredits/cardCreditDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<CardCreditDatasource["updateEarlyPayment"]>[0];
export type Response = ReturnType<CardCreditDatasource["updateEarlyPayment"]>;

async function updateEarlyPayment(params: Params): Response {
  const body = {
    accountId: params.accountId,
    date: params.date,
    description: params.description,
    invoiceMonth: params.invoiceMonth,
    method: params.method,
    value: params.value,
  };

  try {
    await api.patch(
      `/v1/finance/credit-cards/${params.creditCardId}/early-payments/${params.id}?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CardCreditDatasource - updateEarlyPayment",
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default updateEarlyPayment;
