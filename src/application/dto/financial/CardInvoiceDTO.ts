import { InvoiceDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import CardInvoiceEntity, {
  CardInvoiceCardEntity,
  InvoiceCreditEntity,
  InvoiceFilteredEntity,
  InvoicePurchaseEntity,
} from "@domain/entities/financial/CardInvoiceEntity";

class CardInvoiceDTO {
  card: CardInvoiceCardEntity;
  credits: InvoiceCreditEntity[];
  filtered?: InvoiceFilteredEntity;
  invoice: InvoiceDTO;
  purchases: InvoicePurchaseEntity[];

  constructor(params: {
    card: CardInvoiceCardEntity;
    credits?: InvoiceCreditEntity[];
    filtered?: InvoiceFilteredEntity;
    invoice: InvoiceDTO;
    purchases: InvoicePurchaseEntity[];
  }) {
    this.card = params.card;
    this.credits = params.credits ?? [];
    this.filtered = params.filtered;
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }

  static fromEntity(entity: CardInvoiceEntity) {
    return new CardInvoiceDTO({
      card: { ...entity.card },
      credits: entity.credits.map((credit) => ({ ...credit })),
      filtered: entity.filtered && { ...entity.filtered },
      invoice: InvoiceDTO.fromEntity(entity.invoice),
      purchases: entity.purchases.map((purchase) => ({ ...purchase })),
    });
  }
}

export default CardInvoiceDTO;
