import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import { CreditCardDatasource } from "@data/repositories/repos/financial/creditCards/creditCardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<
  CreditCardDatasource["getCreditCardsOverview"]
>[0];
export type Response = ReturnType<
  CreditCardDatasource["getCreditCardsOverview"]
>;

async function getCreditCardsOverview(ownerIds: Params): Response {
  if (ownerIds.length === 0) {
    return CreditCardOverviewModel.empty();
  }

  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/credit-cards/overview${toOwnerQuery(ownerIds)}`,
    );

    return CreditCardOverviewModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "CreditCardDatasource - getCreditCardsOverview",
      ownerIds,
    });
  }
}

export default getCreditCardsOverview;
