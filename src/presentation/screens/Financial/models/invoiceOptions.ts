import {
  closingDateOf,
  dueDateOf,
  invoiceMonthOf,
  purchaseInvoiceOptions,
} from "./invoiceMonth";

interface BuildInvoiceOptionsParams {
  card: { closingDay: number; dueDay: number };
  // Purchase date, `YYYY-MM-DD`.
  date: string;
  // Invoice month stored on the row being edited, when there is one.
  storedMonth?: string;
  summary?: InvoiceSummaryLike;
  // Local day, `YYYY-MM-DD`: tells the open invoice when there is no summary.
  today: string;
}

interface InvoiceOption {
  closingDate: string;
  // A paid invoice does not receive purchases, except the one the date computes (it keeps today's warning).
  disabled: boolean;
  dueDate: string;
  isComputed: boolean;
  month: string;
  // The stored month of an old row that is not among the three options (FR 17).
  readOnly: boolean;
  status: InvoiceOptionStatus;
}

// Spec 095 FR 13: one of the invoices a card purchase can sit on, with what the picker shows about it.
type InvoiceOptionStatus = "CLOSED" | "FUTURE" | "OPEN" | "PAID";

// What the picker needs from the card summary the screen already loads (no new request).
interface InvoiceSummaryLike {
  closedInvoices: { referenceMonth: string; status: string }[];
  openInvoice: { referenceMonth: string };
}

function buildInvoiceOptions(
  params: BuildInvoiceOptionsParams,
): InvoiceOption[] {
  const { card, date, storedMonth, summary, today } = params;
  const computed = invoiceMonthOf(date, card.closingDay);
  const openMonth =
    summary?.openInvoice.referenceMonth ??
    invoiceMonthOf(today, card.closingDay);
  const months = [...purchaseInvoiceOptions(date, card.closingDay)];
  const extra = storedMonth && !months.includes(storedMonth);

  if (extra) {
    months.push(storedMonth);
  }

  function statusOf(month: string): InvoiceOptionStatus {
    const paid = summary?.closedInvoices.some(
      (invoice) =>
        invoice.referenceMonth === month && invoice.status === "PAID",
    );

    if (paid) {
      return "PAID";
    }
    if (month === openMonth) {
      return "OPEN";
    }

    return month < openMonth ? "CLOSED" : "FUTURE";
  }

  return months
    .map((month) => {
      const status = statusOf(month);
      const isComputed = month === computed;

      return {
        closingDate: closingDateOf(month, card.closingDay),
        disabled: status === "PAID" && !isComputed && month !== storedMonth,
        dueDate: dueDateOf(month, card.closingDay, card.dueDay),
        isComputed,
        month,
        readOnly: !!extra && month === storedMonth,
        status,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export { buildInvoiceOptions };
export type { InvoiceOption, InvoiceOptionStatus, InvoiceSummaryLike };
