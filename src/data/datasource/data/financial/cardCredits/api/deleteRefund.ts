import { CardCreditDatasource } from "@data/repositories/repos/financial/cardCredits/cardCreditDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<CardCreditDatasource["deleteRefund"]>[0];
export type Response = ReturnType<CardCreditDatasource["deleteRefund"]>;

async function deleteRefund(params: Params): Response {
  try {
    await api.delete(
      `/v1/finance/credit-cards/${params.creditCardId}/refunds/${params.id}`,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CardCreditDatasource - deleteRefund",
      },
      { unprocessable: unprocessableError },
    );
  }
}

export default deleteRefund;
