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

// A refund, a prepayment discount or an early payment on the invoice (spec 032); money in cents.
export interface InvoiceCreditEntity {
  accountId?: string;
  accountName?: string;
  date: string;
  description: string;
  id: string;
  kind: InvoiceCreditKind;
  method?: "ACCOUNT" | "EXTERNAL";
  refundedName?: string;
  refundedPlanId?: string;
  refundedTransactionId?: string;
  value: number;
}

export type InvoiceCreditKind =
  | "EARLY_PAYMENT"
  | "PREPAYMENT_DISCOUNT"
  | "REFUND";

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
  // Moved into this invoice by a prepayment.
  prepaid?: boolean;
  // Integer cents.
  value: number;
}

// One card invoice with its purchases: a line of the transactions list and the invoice detail.
class CardInvoiceEntity {
  card: CardInvoiceCardEntity;
  credits: InvoiceCreditEntity[];
  invoice: InvoiceEntity;
  purchases: InvoicePurchaseEntity[];

  constructor(params: {
    card: CardInvoiceCardEntity;
    credits?: InvoiceCreditEntity[];
    invoice: InvoiceEntity;
    purchases: InvoicePurchaseEntity[];
  }) {
    this.card = params.card;
    this.credits = params.credits ?? [];
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }
}

export default CardInvoiceEntity;
