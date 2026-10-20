import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import CreditCardModel from "@data/models/financial/CreditCardModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import CardInvoiceEntity from "@domain/entities/financial/CardInvoiceEntity";
import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity, {
  CreditCardSummaryEntity,
} from "@domain/entities/financial/CreditCardOverviewEntity";
import InvoiceEntity from "@domain/entities/financial/InvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

function toCardInvoiceEntity(model: CardInvoiceModel): CardInvoiceEntity {
  return new CardInvoiceEntity({
    card: { ...model.card, owner: OwnerType[model.card.owner] },
    credits: model.credits.map((credit) => ({ ...credit })),
    invoice: new InvoiceEntity({ ...model.invoice }),
    purchases: model.purchases.map((purchase) => ({ ...purchase })),
  });
}

function toCreditCardEntity(model: CreditCardModel): CreditCardEntity {
  return new CreditCardEntity({
    brand: model.brand,
    closingDay: model.closingDay,
    color: model.color,
    currency: model.currency,
    dueDay: model.dueDay,
    id: model.id,
    lastDigits: model.lastDigits,
    limit: model.limit,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
    paymentAccount: model.paymentAccount,
    paymentAccountId: model.paymentAccountId,
    paymentDay: model.paymentDay,
    status: model.status,
    title: model.title,
  });
}

function toOverviewEntity(
  model: CreditCardOverviewModel,
): CreditCardOverviewEntity {
  return new CreditCardOverviewEntity({
    aggregate: { ...model.aggregate },
    cards: model.cards.map(
      (summary) =>
        new CreditCardSummaryEntity({
          available: summary.available,
          card: toCreditCardEntity(summary.card),
          closedInvoices: summary.closedInvoices.map(
            (invoice) => new InvoiceEntity({ ...invoice }),
          ),
          openInvoice: new InvoiceEntity({ ...summary.openInvoice }),
          upcomingInvoices: summary.upcomingInvoices.map(
            (invoice) => new InvoiceEntity({ ...invoice }),
          ),
          used: summary.used,
        }),
    ),
  });
}

export { toCardInvoiceEntity, toCreditCardEntity, toOverviewEntity };
