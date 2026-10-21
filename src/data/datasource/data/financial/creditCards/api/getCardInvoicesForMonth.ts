import { todayCalendarDate } from "@data/models/financial/calendarDate";
import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import appendFilterParams from "../../filterQuery";
import handleFinancialApiError from "../../financialApiError";

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
    const query = new URLSearchParams();

    params.ownerIds.forEach((id) => query.append("ownerId", id));
    if (params.month) {
      query.append("month", params.month);
    }
    query.append("today", todayCalendarDate());
    // Spec 045: the period (instead of the month), search, categories, tags, cards and paid status.
    appendFilterParams(query, params.filter, [
      "categoryIds",
      "creditCardIds",
      "from",
      "paid",
      "q",
      "tagIds",
    ]);

    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/credit-cards/invoices?${query.toString()}`,
    );

    return data.map((item) => CardInvoiceModel.fromJSON(item));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "CreditCardDatasource - getCardInvoicesForMonth",
      month: params.month,
      period: params.filter?.from,
    });
  }
}

export default getCardInvoicesForMonth;
