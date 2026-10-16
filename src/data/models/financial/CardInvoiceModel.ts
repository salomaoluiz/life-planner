import { InvoiceModel } from "@data/models/financial/CreditCardOverviewModel";
import { OwnerType } from "@data/models/financial/TransactionModel";
import { InvoiceCreditKind } from "@domain/entities/financial/CardInvoiceEntity";

export interface InvoiceCreditModel {
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

export interface InvoicePurchaseModel {
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
  prepaid: boolean;
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
  credits: InvoiceCreditModel[];
  invoice: InvoiceModel;
  purchases: InvoicePurchaseModel[];

  constructor(params: {
    card: CardInvoiceModel["card"];
    credits?: InvoiceCreditModel[];
    invoice: InvoiceModel;
    purchases: InvoicePurchaseModel[];
  }) {
    this.card = params.card;
    this.credits = params.credits ?? [];
    this.invoice = params.invoice;
    this.purchases = params.purchases;
  }

  static fromJSON(data: Record<string, unknown>): CardInvoiceModel {
    const card = data.card as Record<string, unknown>;
    const purchases = (data.purchases ?? []) as Record<string, unknown>[];
    const credits = (data.credits ?? []) as Record<string, unknown>[];

    return new CardInvoiceModel({
      card: {
        color: card.color as string,
        id: card.id as string,
        lastDigits: (card.lastDigits as string | undefined) ?? undefined,
        owner: card.owner as OwnerType,
        ownerId: card.ownerId as string,
        title: card.title as string,
      },
      credits: credits.map((credit) => ({
        accountId: (credit.accountId as null | string) ?? undefined,
        accountName: (credit.accountName as null | string) ?? undefined,
        date: credit.date as string,
        description: credit.description as string,
        id: credit.id as string,
        kind: credit.kind as InvoiceCreditKind,
        method: (credit.method as "ACCOUNT" | "EXTERNAL" | null) ?? undefined,
        refundedName: (credit.refundedName as null | string) ?? undefined,
        refundedPlanId: (credit.refundedPlanId as null | string) ?? undefined,
        refundedTransactionId:
          (credit.refundedTransactionId as null | string) ?? undefined,
        value: Number(credit.value),
      })),
      invoice: InvoiceModel.fromJSON(data.invoice as Record<string, unknown>),
      purchases: purchases.map((purchase) => ({
        category: purchase.category as string,
        categoryIcon: purchase.categoryIcon as string | undefined,
        categoryIconColor: purchase.categoryIconColor as string | undefined,
        categoryId: purchase.categoryId as string,
        date: purchase.date as string,
        description: purchase.description as string,
        id: purchase.id as string,
        installmentCount:
          (purchase.installmentCount as null | number) ?? undefined,
        installmentNumber:
          (purchase.installmentNumber as null | number) ?? undefined,
        ownerId: purchase.ownerId as string,
        prepaid: Boolean(purchase.prepaid),
        value: Number(purchase.value),
      })),
    });
  }
}

export default CardInvoiceModel;
