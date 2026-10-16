import InvoiceEntity from "@domain/entities/financial/InvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface CardInvoiceCardEntity {
  color: string;
  id: string;
  lastDigits?: string;
  owner: OwnerType;
  ownerId: string;
  title: string;
}

export interface InvoicePurchaseEntity {
  category: string;
  categoryIcon?: string;
  categoryIconColor?: string;
  categoryId: string;
  date: string;
  description: string;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  ownerId: string;
  // Integer cents.
  value: number;
}

// One card invoice with its purchases: a line of the transactions list and the invoice detail.
class CardInvoiceEntity {
  card: CardInvoiceCardEntity;
  invoice: InvoiceEntity;
  purchases: InvoicePurchaseEntity[];

  constructor(params: {
    card: CardInvoiceCardEntity;
    invoice: InvoiceEntity;
    purchases: InvoicePurchaseEntity[];
  }) {
    this.card = params.card;
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }
}

export default CardInvoiceEntity;
