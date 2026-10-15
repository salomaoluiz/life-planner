import { todayCalendarDate } from "@data/models/financial/calendarDate";
import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CreditCardDatasource["getCardInvoice"]>[0];
export type Response = ReturnType<CreditCardDatasource["getCardInvoice"]>;

async function getCardInvoice(params: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/credit-cards/${params.creditCardId}/invoices/${params.month}?today=${todayCalendarDate()}`,
    );

    return CardInvoiceModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      creditCardId: params.creditCardId,
      datasource: "CreditCardDatasource - getCardInvoice",
      month: params.month,
    });
  }
}

export default getCardInvoice;
