export enum InvoiceStatus {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  PAID = "PAID",
}

interface IInvoiceEntity {
  amount: number;
  closingDate: string;
  dueDate: string;
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
    this.paymentAfterDue = params.paymentAfterDue;
    this.paymentDate = params.paymentDate;
    this.periodEnd = params.periodEnd;
    this.periodStart = params.periodStart;
    this.referenceMonth = params.referenceMonth;
    this.status = params.status;
  }
}

export default InvoiceEntity;
