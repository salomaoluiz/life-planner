import type { InvoiceFieldOption } from "@components";
import type { TranslationKeys, UseTranslation } from "@presentation/i18n/types";
import { formatDayMonth } from "@screens/Financial/Cards/models/cardList";
import type {
  InvoiceOption,
  InvoiceOptionStatus,
} from "@screens/Financial/models/invoiceOptions";

const STATUS_KEYS: Record<InvoiceOptionStatus, TranslationKeys> = {
  CLOSED: "financial.transactions.form.invoiceStatus.closed",
  FUTURE: "financial.transactions.form.invoiceStatus.future",
  OPEN: "financial.transactions.form.invoiceStatus.open",
  PAID: "financial.transactions.form.invoiceStatus.paid",
};

function monthDateOf(month: string) {
  const [year, value] = month.split("-").map(Number);

  return new Date(year, value - 1, 1);
}

function monthLabel(month: string, localeTag: string, withYear: boolean) {
  return new Intl.DateTimeFormat(localeTag, {
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(monthDateOf(month));
}

// Spec 095 FR 13: one row of the invoice picker: month, closing and due dates, status chip. A paid invoice that
// is not the computed one is disabled with its reason as text.
function toInvoiceFieldOption(
  option: InvoiceOption,
  t: ReturnType<UseTranslation>["t"],
  localeTag: string,
): InvoiceFieldOption {
  const month = monthLabel(option.month, localeTag, option.readOnly);
  const dates = {
    closing: formatDayMonth(option.closingDate),
    due: formatDayMonth(option.dueDate),
  };
  const refusesPurchases = option.status === "PAID" && option.disabled;
  const closed = option.status === "CLOSED" || option.status === "PAID";
  let subtitle = t(
    closed
      ? "financial.transactions.form.invoiceClosedOn"
      : "financial.transactions.form.invoiceCloses",
    dates,
  );

  if (refusesPurchases) {
    subtitle = t("financial.transactions.form.invoicePaidOption");
  }

  return {
    disabled: option.disabled,
    fieldLabel: t("financial.transactions.form.invoiceFieldValue", {
      due: dates.due,
      month,
    }),
    statusLabel: t(STATUS_KEYS[option.status]),
    statusTone: option.status === "OPEN" ? "income" : "neutral",
    subtitle,
    title: option.isComputed
      ? t("financial.transactions.form.invoiceByDate", { month })
      : month,
    value: option.month,
  };
}

export { monthLabel, toInvoiceFieldOption };
