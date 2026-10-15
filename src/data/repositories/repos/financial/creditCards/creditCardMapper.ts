import CreditCardModel from "@data/models/financial/CreditCardModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity, {
  CreditCardSummaryEntity,
} from "@domain/entities/financial/CreditCardOverviewEntity";
import InvoiceEntity from "@domain/entities/financial/InvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

function toCreditCardEntity(model: CreditCardModel): CreditCardEntity {
  return new CreditCardEntity({
    brand: model.brand,
    closingDay: model.closingDay,
    color: model.color,
    dueDay: model.dueDay,
    id: model.id,
    lastDigits: model.lastDigits,
    limit: model.limit,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
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
          used: summary.used,
        }),
    ),
  });
}

export { toCreditCardEntity, toOverviewEntity };
