import { CardCreditDatasource } from "@data/repositories/repos/financial/cardCredits/cardCreditDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<CardCreditDatasource["deleteEarlyPayment"]>[0];
export type Response = ReturnType<CardCreditDatasource["deleteEarlyPayment"]>;

async function deleteEarlyPayment(params: Params): Response {
  try {
    await api.delete(
      `/v1/finance/credit-cards/${params.creditCardId}/early-payments/${params.id}`,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CardCreditDatasource - deleteEarlyPayment",
      },
      { unprocessable: unprocessableError },
    );
  }
}

export default deleteEarlyPayment;
