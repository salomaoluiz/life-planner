import { Datasources } from "@data/datasource";
import CardInvoiceEntity from "@domain/entities/financial/CardInvoiceEntity";
import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import { FinancialCreditCardRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import {
  toCardInvoiceEntity,
  toCreditCardEntity,
  toOverviewEntity,
} from "./creditCardMapper";

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
    async getCardInvoice(params): Promise<CardInvoiceEntity> {
      return toCardInvoiceEntity(await datasource().getCardInvoice(params));
    },
    async getCardInvoicesForMonth(params): Promise<CardInvoiceEntity[]> {
      const invoices = await datasource().getCardInvoicesForMonth(params);

      return invoices.map((invoice) => toCardInvoiceEntity(invoice));
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
    async payInvoice(params): Promise<void> {
      await datasource().payInvoice(params);
      // An account payment writes a transaction and moves the account balance.
      invalidateFinancialCaches();
    },
    async undoInvoicePayment(params): Promise<void> {
      await datasource().undoInvoicePayment(params);
      invalidateFinancialCaches();
    },
    async updateCreditCard(params): Promise<void> {
      return datasource().updateCreditCard(params);
    },
  };
}

function invalidateFinancialCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export default creditCardRepositoryImpl;
