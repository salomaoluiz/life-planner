import CreditCardModel from "@data/models/financial/CreditCardModel";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";
import {
  InvoicePaymentEntity,
  InvoiceStatus,
} from "@domain/entities/financial/InvoiceEntity";

class CreditCardOverviewModel {
  aggregate: {
    available: number;
    projectedUsed?: number;
    totalLimit: number;
    used: number;
  };
  cards: CreditCardSummaryModel[];

  constructor(params: {
    aggregate: {
      available: number;
      projectedUsed?: number;
      totalLimit: number;
      used: number;
    };
    cards: CreditCardSummaryModel[];
  }) {
    this.aggregate = params.aggregate;
    this.cards = params.cards;
  }

  static empty(): CreditCardOverviewModel {
    return new CreditCardOverviewModel({
      aggregate: { available: 0, projectedUsed: 0, totalLimit: 0, used: 0 },
      cards: [],
    });
  }

  static fromJSON(data: Record<string, unknown>): CreditCardOverviewModel {
    const aggregate = data.aggregate as Record<string, unknown>;
    const cards = data.cards as Record<string, unknown>[];

    return new CreditCardOverviewModel({
      aggregate: {
        available: Number(aggregate.available),
        projectedUsed: Number(aggregate.projectedUsed ?? 0),
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
            projectedUsed: Number(item.projectedUsed ?? 0),
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
  projectedUsed: number;
  upcomingInvoices: InvoiceModel[];
  used: number;

  constructor(params: {
    available: number;
    card: CreditCardModel;
    closedInvoices: InvoiceModel[];
    openInvoice: InvoiceModel;
    projectedUsed?: number;
    upcomingInvoices: InvoiceModel[];
    used: number;
  }) {
    this.available = params.available;
    this.card = params.card;
    this.closedInvoices = params.closedInvoices;
    this.openInvoice = params.openInvoice;
    this.projectedUsed = params.projectedUsed ?? 0;
    this.upcomingInvoices = params.upcomingInvoices;
    this.used = params.used;
  }
}

export class InvoiceModel {
  amount: number;
  amountDue: number;
  carryIn: number;
  closingDate: string;
  currency: CurrencyCode;
  dueDate: string;
  earlyPaid: number;
  listDate: string;
  net: number;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  projectedAmount: number;
  projectedCount: number;
  projectedTotal: number;
  referenceMonth: string;
  status: InvoiceStatus;
  total: number;

  constructor(params: {
    amount: number;
    amountDue: number;
    carryIn: number;
    closingDate: string;
    currency?: CurrencyCode;
    dueDate: string;
    earlyPaid: number;
    listDate: string;
    net: number;
    payment?: InvoicePaymentEntity;
    paymentAfterDue: boolean;
    paymentDate: string;
    periodEnd: string;
    periodStart: string;
    projectedAmount?: number;
    projectedCount?: number;
    projectedTotal?: number;
    referenceMonth: string;
    status: InvoiceStatus;
    total: number;
  }) {
    this.amount = params.amount;
    this.amountDue = params.amountDue;
    this.carryIn = params.carryIn;
    this.closingDate = params.closingDate;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.dueDate = params.dueDate;
    this.earlyPaid = params.earlyPaid;
    this.listDate = params.listDate;
    this.net = params.net;
    this.payment = params.payment;
    this.paymentAfterDue = params.paymentAfterDue;
    this.paymentDate = params.paymentDate;
    this.periodEnd = params.periodEnd;
    this.periodStart = params.periodStart;
    this.projectedAmount = params.projectedAmount ?? 0;
    this.projectedCount = params.projectedCount ?? 0;
    this.projectedTotal = params.projectedTotal ?? params.amountDue;
    this.referenceMonth = params.referenceMonth;
    this.status = params.status;
    this.total = params.total;
  }

  static fromJSON(data: Record<string, unknown>): InvoiceModel {
    return new InvoiceModel({
      amount: Number(data.amount),
      amountDue: Number(data.amountDue ?? data.amount),
      carryIn: Number(data.carryIn ?? 0),
      closingDate: data.closingDate as string,
      currency: toCurrencyCode(data.currency),
      dueDate: data.dueDate as string,
      earlyPaid: Number(data.earlyPaid ?? 0),
      listDate:
        (data.listDate as string | undefined) ?? (data.paymentDate as string),
      net: Number(data.net ?? data.amount),
      payment: toPayment(data.payment as null | Record<string, unknown>),
      paymentAfterDue: Boolean(data.paymentAfterDue),
      paymentDate: data.paymentDate as string,
      periodEnd: data.periodEnd as string,
      periodStart: data.periodStart as string,
      // Lean payload: absent = nothing projected.
      projectedAmount: Number(data.projectedAmount ?? 0),
      projectedCount: Number(data.projectedCount ?? 0),
      projectedTotal:
        data.projectedTotal === undefined
          ? undefined
          : Number(data.projectedTotal),
      referenceMonth: data.referenceMonth as string,
      status: data.status as InvoiceStatus,
      total: Number(data.total ?? data.amount),
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
