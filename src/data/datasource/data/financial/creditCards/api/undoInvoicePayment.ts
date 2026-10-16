import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CreditCardDatasource["undoInvoicePayment"]>[0];
export type Response = ReturnType<CreditCardDatasource["undoInvoicePayment"]>;

async function undoInvoicePayment(params: Params): Response {
  try {
    await api.delete(
      `/v1/finance/credit-cards/${params.creditCardId}/invoices/${params.month}/payment`,
    );
  } catch (error) {
    return handleFinancialApiError(error, {
      creditCardId: params.creditCardId,
      datasource: "CreditCardDatasource - undoInvoicePayment",
      month: params.month,
    });
  }
}

export default undoInvoicePayment;
