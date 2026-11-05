import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import {
  InvoiceHasProjected,
  InvoiceNotPayable,
} from "@domain/entities/errors";
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
        // Spec 096 FR 10: a 409 with the list of projected purchases to resolve first.
        conflict: (_, errorBody) =>
          Array.isArray(errorBody.projected)
            ? new InvoiceHasProjected(
                (errorBody.projected as Record<string, unknown>[]).map(
                  (item) => ({
                    date: item.date as string,
                    description: item.description as string,
                    id: item.id as string,
                    recurrenceId:
                      (item.recurrenceId as null | string) ?? undefined,
                    value: Number(item.value),
                  }),
                ),
              )
            : new InvoiceNotPayable(),
        fields: body,
        unprocessable: () => new InvoiceNotPayable(),
      },
    );
  }
}

export default payInvoice;
