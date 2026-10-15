import { InvoiceModel } from "@data/models/financial/CreditCardOverviewModel";
import { OwnerType } from "@data/models/financial/TransactionModel";

export interface InvoicePurchaseModel {
  category: string;
  categoryIcon?: string;
  categoryIconColor?: string;
  categoryId: string;
  date: string;
  description: string;
  id: string;
  ownerId: string;
  value: number;
}

// One invoice with its purchases: the API shape of `GET /credit-cards/invoices` and `…/:id/invoices/:month`.
class CardInvoiceModel {
  card: {
    color: string;
    id: string;
    lastDigits?: string;
    owner: OwnerType;
    ownerId: string;
    title: string;
  };
  invoice: InvoiceModel;
  purchases: InvoicePurchaseModel[];

  constructor(params: {
    card: CardInvoiceModel["card"];
    invoice: InvoiceModel;
    purchases: InvoicePurchaseModel[];
  }) {
    this.card = params.card;
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }

  static fromJSON(data: Record<string, unknown>): CardInvoiceModel {
    const card = data.card as Record<string, unknown>;
    const purchases = (data.purchases ?? []) as Record<string, unknown>[];

    return new CardInvoiceModel({
      card: {
        color: card.color as string,
        id: card.id as string,
        lastDigits: (card.lastDigits as string | undefined) ?? undefined,
        owner: card.owner as OwnerType,
        ownerId: card.ownerId as string,
        title: card.title as string,
      },
      invoice: InvoiceModel.fromJSON(data.invoice as Record<string, unknown>),
      purchases: purchases.map((purchase) => ({
        category: purchase.category as string,
        categoryIcon: purchase.categoryIcon as string | undefined,
        categoryIconColor: purchase.categoryIconColor as string | undefined,
        categoryId: purchase.categoryId as string,
        date: purchase.date as string,
        description: purchase.description as string,
        id: purchase.id as string,
        ownerId: purchase.ownerId as string,
        value: Number(purchase.value),
      })),
    });
  }
}

export default CardInvoiceModel;
