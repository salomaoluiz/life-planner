import CreditCardModel from "@data/models/financial/CreditCardModel";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CreditCardDatasource["createCreditCard"]>[0];
export type Response = ReturnType<CreditCardDatasource["createCreditCard"]>;

async function createCreditCard(params: Params): Response {
  const body = {
    brand: params.brand,
    closingDay: params.closingDay,
    color: params.color,
    dueDay: params.dueDay,
    lastDigits: params.lastDigits,
    limit: params.limit,
    owner: params.owner,
    ownerId: params.ownerId,
    paymentDay: params.paymentDay,
    title: params.title,
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      "/v1/finance/credit-cards",
      body,
    );

    return CreditCardModel.fromJSON(data);
  } catch (error) {
    // Context holds ids only: never the title or the last digits.
    return handleFinancialApiError(
      error,
      {
        datasource: "CreditCardDatasource - createCreditCard",
        ownerId: params.ownerId,
      },
      {
        fields: {
          closingDay: params.closingDay,
          dueDay: params.dueDay,
          limit: params.limit,
          paymentDay: params.paymentDay,
        },
      },
    );
  }
}

export default createCreditCard;
