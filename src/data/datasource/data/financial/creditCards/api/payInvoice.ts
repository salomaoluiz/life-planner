import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { InvoiceNotPayable } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CreditCardDatasource["payInvoice"]>[0];
export type Response = ReturnType<CreditCardDatasource["payInvoice"]>;

async function payInvoice(params: Params): Response {
  const body = {
    accountId: params.accountId,
    method: params.method,
    paidOn: params.paidOn,
  };

  try {
    await api.post(
      `/v1/finance/credit-cards/${params.creditCardId}/invoices/${params.month}/payment?today=${todayCalendarDate()}`,
      body,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        creditCardId: params.creditCardId,
        datasource: "CreditCardDatasource - payInvoice",
        month: params.month,
      },
      {
        conflict: () => new InvoiceNotPayable(),
        fields: body,
        unprocessable: () => new InvoiceNotPayable(),
      },
    );
  }
}

export default payInvoice;
