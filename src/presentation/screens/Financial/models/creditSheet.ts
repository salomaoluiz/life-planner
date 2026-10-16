import { CreditCardSummaryDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import { invoiceMonthOf } from "@screens/Financial/models/invoiceMonth";

// An invoice a credit (prepayment, refund, early payment) can be put on: open or closed, with no payment record (spec 032).
export interface AssignableInvoice {
  // What is due now (cents).
  amountDueCents: number;
  month: string;
  status: "CLOSED" | "OPEN";
  // net + carry-in (cents); below 0 the invoice holds a credit.
  totalCents: number;
}

// The open invoice first, then the closed ones that are not paid by a record.
function assignableInvoices(
  summary?: CreditCardSummaryDTO,
): AssignableInvoice[] {
  if (!summary) {
    return [];
  }

  const closed = summary.closedInvoices.filter((invoice) => !invoice.payment);

  return [
    { invoice: summary.openInvoice, status: "OPEN" as const },
    ...closed.map((invoice) => ({ invoice, status: "CLOSED" as const })),
  ].map(({ invoice, status }) => ({
    amountDueCents: invoice.amount,
    month: invoice.referenceMonth,
    status,
    totalCents: invoice.total,
  }));
}

// The invoice of a date by the card's closing rule when it can take credits, else the open one (spec 032 FR 22).
function defaultInvoiceMonth(
  isoDate: string,
  closingDay: number,
  invoices: AssignableInvoice[],
): string | undefined {
  const byDate = invoiceMonthOf(isoDate, closingDay);

  return invoices.find((invoice) => invoice.month === byDate)
    ? byDate
    : invoices[0]?.month;
}

// `YYYY-MM-DD` of a local Date.
function toCalendarDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export { assignableInvoices, defaultInvoiceMonth, toCalendarDate, todayDate };
