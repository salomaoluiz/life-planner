import CreditCardModel from "@data/models/financial/CreditCardModel";
import {
  InvoicePaymentEntity,
  InvoiceStatus,
} from "@domain/entities/financial/InvoiceEntity";

class CreditCardOverviewModel {
  aggregate: { available: number; totalLimit: number; used: number };
  cards: CreditCardSummaryModel[];

  constructor(params: {
    aggregate: { available: number; totalLimit: number; used: number };
    cards: CreditCardSummaryModel[];
  }) {
    this.aggregate = params.aggregate;
    this.cards = params.cards;
  }

  static empty(): CreditCardOverviewModel {
    return new CreditCardOverviewModel({
      aggregate: { available: 0, totalLimit: 0, used: 0 },
      cards: [],
    });
  }

  static fromJSON(data: Record<string, unknown>): CreditCardOverviewModel {
    const aggregate = data.aggregate as Record<string, unknown>;
    const cards = data.cards as Record<string, unknown>[];

    return new CreditCardOverviewModel({
      aggregate: {
        available: Number(aggregate.available),
        totalLimit: Number(aggregate.totalLimit),
        used: Number(aggregate.used),
      },
      cards: cards.map(
        (item) =>
          new CreditCardSummaryModel({
            available: Number(item.available),
            card: CreditCardModel.fromJSON(
              item.card as Record<string, unknown>,
            ),
            closedInvoices: (
              item.closedInvoices as Record<string, unknown>[]
            ).map((invoice) => InvoiceModel.fromJSON(invoice)),
            openInvoice: InvoiceModel.fromJSON(
              item.openInvoice as Record<string, unknown>,
            ),
            upcomingInvoices: (
              (item.upcomingInvoices ?? []) as Record<string, unknown>[]
            ).map((invoice) => InvoiceModel.fromJSON(invoice)),
            used: Number(item.used),
          }),
      ),
    });
  }
}

export class CreditCardSummaryModel {
  available: number;
  card: CreditCardModel;
  closedInvoices: InvoiceModel[];
  openInvoice: InvoiceModel;
  upcomingInvoices: InvoiceModel[];
  used: number;

  constructor(params: {
    available: number;
    card: CreditCardModel;
    closedInvoices: InvoiceModel[];
    openInvoice: InvoiceModel;
    upcomingInvoices: InvoiceModel[];
    used: number;
  }) {
    this.available = params.available;
    this.card = params.card;
    this.closedInvoices = params.closedInvoices;
    this.openInvoice = params.openInvoice;
    this.upcomingInvoices = params.upcomingInvoices;
    this.used = params.used;
  }
}

export class InvoiceModel {
  amount: number;
  closingDate: string;
  dueDate: string;
  listDate: string;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: InvoiceStatus;

  constructor(params: {
    amount: number;
    closingDate: string;
    dueDate: string;
    listDate: string;
    payment?: InvoicePaymentEntity;
    paymentAfterDue: boolean;
    paymentDate: string;
    periodEnd: string;
    periodStart: string;
    referenceMonth: string;
    status: InvoiceStatus;
  }) {
    this.amount = params.amount;
    this.closingDate = params.closingDate;
    this.dueDate = params.dueDate;
    this.listDate = params.listDate;
    this.payment = params.payment;
    this.paymentAfterDue = params.paymentAfterDue;
    this.paymentDate = params.paymentDate;
    this.periodEnd = params.periodEnd;
    this.periodStart = params.periodStart;
    this.referenceMonth = params.referenceMonth;
    this.status = params.status;
  }

  static fromJSON(data: Record<string, unknown>): InvoiceModel {
    return new InvoiceModel({
      amount: Number(data.amount),
      closingDate: data.closingDate as string,
      dueDate: data.dueDate as string,
      listDate:
        (data.listDate as string | undefined) ?? (data.paymentDate as string),
      payment: toPayment(data.payment as null | Record<string, unknown>),
      paymentAfterDue: Boolean(data.paymentAfterDue),
      paymentDate: data.paymentDate as string,
      periodEnd: data.periodEnd as string,
      periodStart: data.periodStart as string,
      referenceMonth: data.referenceMonth as string,
      status: data.status as InvoiceStatus,
    });
  }
}

function toPayment(
  data: null | Record<string, unknown> | undefined,
): InvoicePaymentEntity | undefined {
  if (!data) {
    return undefined;
  }

  return {
    accountId: (data.accountId as null | string) ?? undefined,
    accountName: (data.accountName as null | string) ?? undefined,
    amount: Number(data.amount),
    method: data.method as InvoicePaymentEntity["method"],
    paidOn: data.paidOn as string,
  };
}

export { toPayment };
export default CreditCardOverviewModel;
