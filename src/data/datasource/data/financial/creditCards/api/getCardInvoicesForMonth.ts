import { todayCalendarDate } from "@data/models/financial/calendarDate";
import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<
  CreditCardDatasource["getCardInvoicesForMonth"]
>[0];
export type Response = ReturnType<
  CreditCardDatasource["getCardInvoicesForMonth"]
>;

// The invoices whose list day (real payment day once paid, else the planned one) is in `month`.
async function getCardInvoicesForMonth(params: Params): Response {
  if (params.ownerIds.length === 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/credit-cards/invoices${toOwnerQuery(params.ownerIds)}&month=${params.month}&today=${todayCalendarDate()}`,
    );

    return data.map((item) => CardInvoiceModel.fromJSON(item));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "CreditCardDatasource - getCardInvoicesForMonth",
      month: params.month,
    });
  }
}

export default getCardInvoicesForMonth;
