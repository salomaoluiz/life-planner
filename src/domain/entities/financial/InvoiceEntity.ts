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
}

// Dates are `YYYY-MM-DD` strings, `referenceMonth` is `YYYY-MM`; money is in cents.
class InvoiceEntity implements IInvoiceEntity {
  amount: number;
  closingDate: string;
  dueDate: string;
  // The day the list shows the invoice: the real payment day once paid, else the planned one.
  listDate: string;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: InvoiceStatus;

  constructor(params: IInvoiceEntity) {
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
}

export default InvoiceEntity;
