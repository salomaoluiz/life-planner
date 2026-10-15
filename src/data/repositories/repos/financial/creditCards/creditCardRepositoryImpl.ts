import { Datasources } from "@data/datasource";
import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import { FinancialCreditCardRepository } from "@domain/repositories/financial";

import { toCreditCardEntity, toOverviewEntity } from "./creditCardMapper";

function creditCardRepositoryImpl(
  datasources: Datasources,
): FinancialCreditCardRepository {
  function datasource() {
    return datasources.financialCreditCardDatasource;
  }

  return {
    async createCreditCard(params): Promise<CreditCardEntity> {
      return toCreditCardEntity(await datasource().createCreditCard(params));
    },
    async deleteCreditCard(params): Promise<void> {
      return datasource().deleteCreditCard({ id: params.id });
    },
    async getCreditCards(ownerIds): Promise<CreditCardEntity[]> {
      const cards = await datasource().getCreditCards(ownerIds);

      return cards.map((card) => toCreditCardEntity(card));
    },
    async getCreditCardsOverview(ownerIds): Promise<CreditCardOverviewEntity> {
      return toOverviewEntity(
        await datasource().getCreditCardsOverview(ownerIds),
      );
    },
    async updateCreditCard(params): Promise<void> {
      return datasource().updateCreditCard(params);
    },
  };
}

export default creditCardRepositoryImpl;
