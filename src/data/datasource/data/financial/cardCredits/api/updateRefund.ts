import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CardCreditDatasource } from "@data/repositories/repos/financial/cardCredits/cardCreditDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<CardCreditDatasource["updateRefund"]>[0];
export type Response = ReturnType<CardCreditDatasource["updateRefund"]>;

async function updateRefund(params: Params): Response {
  const body = {
    date: params.date,
    description: params.description,
    invoiceMonth: params.invoiceMonth,
    refundedPlanId: params.refundedPlanId,
    refundedTransactionId: params.refundedTransactionId,
    value: params.value,
  };

  try {
    await api.patch(
      `/v1/finance/credit-cards/${params.creditCardId}/refunds/${params.id}?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CardCreditDatasource - updateRefund",
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default updateRefund;
