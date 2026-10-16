import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CardCreditDatasource } from "@data/repositories/repos/financial/cardCredits/cardCreditDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<CardCreditDatasource["createRefund"]>[0];
export type Response = ReturnType<CardCreditDatasource["createRefund"]>;

async function createRefund(params: Params): Response {
  const body = {
    date: params.date,
    description: params.description,
    invoiceMonth: params.invoiceMonth,
    refundedPlanId: params.refundedPlanId,
    refundedTransactionId: params.refundedTransactionId,
    value: params.value,
  };

  try {
    await api.post(
      `/v1/finance/credit-cards/${params.creditCardId}/refunds?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CardCreditDatasource - createRefund",
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default createRefund;
