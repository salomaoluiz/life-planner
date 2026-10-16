import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CardCreditDatasource } from "@data/repositories/repos/financial/cardCredits/cardCreditDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<CardCreditDatasource["createEarlyPayment"]>[0];
export type Response = ReturnType<CardCreditDatasource["createEarlyPayment"]>;

async function createEarlyPayment(params: Params): Response {
  const body = {
    accountId: params.accountId,
    date: params.date,
    description: params.description,
    invoiceMonth: params.invoiceMonth,
    method: params.method,
    value: params.value,
  };

  try {
    await api.post(
      `/v1/finance/credit-cards/${params.creditCardId}/early-payments?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CardCreditDatasource - createEarlyPayment",
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default createEarlyPayment;
