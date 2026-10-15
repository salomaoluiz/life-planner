import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CreditCardDatasource["updateCreditCard"]>[0];
export type Response = ReturnType<CreditCardDatasource["updateCreditCard"]>;

async function updateCreditCard(params: Params): Response {
  const { id, ...fields } = params;
  // `undefined` is left out, `null` travels (clears paymentDay / lastDigits).
  const body = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(body).length === 0) {
    return;
  }

  try {
    await api.patch(`/v1/finance/credit-cards/${id}`, body);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "CreditCardDatasource - updateCreditCard", id },
      { fields: {} },
    );
  }
}

export default updateCreditCard;
