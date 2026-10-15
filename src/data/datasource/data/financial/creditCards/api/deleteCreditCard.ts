import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { CreditCardHasTransactions } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CreditCardDatasource["deleteCreditCard"]>[0];
export type Response = ReturnType<CreditCardDatasource["deleteCreditCard"]>;

async function deleteCreditCard(params: Params): Response {
  try {
    await api.delete(`/v1/finance/credit-cards/${params.id}`);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "CreditCardDatasource - deleteCreditCard", id: params.id },
      { conflict: () => new CreditCardHasTransactions() },
    );
  }
}

export default deleteCreditCard;
