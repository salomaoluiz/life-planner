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

// What a filtered invoice keeps: the signed sum (cents) and how many rows matched out of all its rows.
export interface InvoiceFilteredEntity {
  filteredTotal: number;
  matchedCount: number;
  purchaseCount: number;
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
  // Moved into this invoice by a prepayment.
  prepaid?: boolean;
  // Integer cents.
  value: number;
}

// One card invoice with its purchases: a line of the transactions list and the invoice detail.
class CardInvoiceEntity {
  card: CardInvoiceCardEntity;
  credits: InvoiceCreditEntity[];
  // Spec 045: set when the list was filtered; `purchases`/`credits` then hold only the matching rows.
  filtered?: InvoiceFilteredEntity;
  invoice: InvoiceEntity;
  purchases: InvoicePurchaseEntity[];

  constructor(params: {
    card: CardInvoiceCardEntity;
    credits?: InvoiceCreditEntity[];
    filtered?: InvoiceFilteredEntity;
    invoice: InvoiceEntity;
    purchases: InvoicePurchaseEntity[];
  }) {
    this.card = params.card;
    this.credits = params.credits ?? [];
    this.filtered = params.filtered;
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }
}

export default CardInvoiceEntity;
