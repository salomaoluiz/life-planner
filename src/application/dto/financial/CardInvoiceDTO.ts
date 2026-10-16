import { InvoiceDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import CardInvoiceEntity, {
  CardInvoiceCardEntity,
  InvoicePurchaseEntity,
} from "@domain/entities/financial/CardInvoiceEntity";

class CardInvoiceDTO {
  card: CardInvoiceCardEntity;
  invoice: InvoiceDTO;
  purchases: InvoicePurchaseEntity[];

  constructor(params: {
    card: CardInvoiceCardEntity;
    invoice: InvoiceDTO;
    purchases: InvoicePurchaseEntity[];
  }) {
    this.card = params.card;
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }

  static fromEntity(entity: CardInvoiceEntity) {
    return new CardInvoiceDTO({
      card: { ...entity.card },
      invoice: InvoiceDTO.fromEntity(entity.invoice),
      purchases: entity.purchases.map((purchase) => ({ ...purchase })),
    });
  }
}

export default CardInvoiceDTO;
