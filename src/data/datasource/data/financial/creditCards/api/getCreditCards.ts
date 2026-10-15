import CreditCardModel from "@data/models/financial/CreditCardModel";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<CreditCardDatasource["getCreditCards"]>[0];
export type Response = ReturnType<CreditCardDatasource["getCreditCards"]>;

async function getCreditCards(ownerIds: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/credit-cards${toOwnerQuery(ownerIds)}`,
    );

    return data.map((card) => CreditCardModel.fromJSON(card));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "CreditCardDatasource - getCreditCards",
      ownerIds,
    });
  }
}

export default getCreditCards;
