import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
export enum InvoiceStatus {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  PAID = "PAID",
}

// How an invoice was paid: from an app account or outside the app (boleto).
export interface InvoicePaymentEntity {
  accountId?: string;
  accountName?: string;
  amount: number;
  method: InvoicePaymentMethod;
  paidOn: string;
}

export type InvoicePaymentMethod = "ACCOUNT" | "EXTERNAL";

interface IInvoiceEntity {
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
  referenceMonth: string;
  status: InvoiceStatus;
  total: number;
}

// Dates are `YYYY-MM-DD` strings, `referenceMonth` is `YYYY-MM`; money is in cents.
class InvoiceEntity implements IInvoiceEntity {
  // What is due (cents): `amountDue`, frozen on the payment once paid.
  amount: number;
  amountDue: number;
  // Negative credit coming from the previous invoice (cents, <= 0).
  carryIn: number;
  closingDate: string;
  currency: CurrencyCode;
  dueDate: string;
  // Σ of the early payments of the invoice.
  earlyPaid: number;
  // The day the list shows the invoice: the real payment day once paid, else the planned one.
  listDate: string;
  // Purchases minus credits of this invoice month.
  net: number;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: InvoiceStatus;
  // net + carryIn; below 0 the credit moves to the next invoice.
  total: number;

  constructor(params: IInvoiceEntity) {
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
    this.referenceMonth = params.referenceMonth;
    this.status = params.status;
    this.total = params.total;
  }
}

export default InvoiceEntity;
