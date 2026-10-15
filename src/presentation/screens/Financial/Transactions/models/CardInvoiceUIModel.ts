import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";

const FALLBACK_ICON = "help-circle-outline";

export interface InvoicePurchaseUIModel {
  amountCents: number;
  categoryColor?: string;
  categoryIcon: string;
  categoryName: string;
  date: Date;
  description: string;
  id: string;
}

// One card invoice as a line of the transactions list (spec 029 FR 24).
class CardInvoiceUIModel {
  get amountCents() {
    return this.dto.invoice.amount;
  }

  get cardColor() {
    return this.dto.card.color;
  }

  get cardId() {
    return this.dto.card.id;
  }

  get cardTitle() {
    return this.dto.card.title;
  }

  get dateKey() {
    return this.dto.invoice.listDate;
  }

  get dates() {
    const { closingDate, dueDate, paymentDate } = this.dto.invoice;

    return { closingDate, dueDate, paymentDate };
  }

  get id() {
    return `${this.dto.card.id}:${this.dto.invoice.referenceMonth}`;
  }

  get lastDigits() {
    return this.dto.card.lastDigits;
  }

  get listDate() {
    return parseCalendarDate(this.dto.invoice.listDate);
  }

  get ownerId() {
    return this.dto.card.ownerId;
  }

  get paidAccountName() {
    return this.dto.invoice.payment?.accountName;
  }

  get paidExternal() {
    return this.dto.invoice.payment?.method === "EXTERNAL";
  }

  // `YYYY-MM-DD` the invoice was paid on.
  get paidOn() {
    return this.dto.invoice.payment?.paidOn;
  }

  get paymentAfterDue() {
    return this.dto.invoice.paymentAfterDue;
  }

  get purchases(): InvoicePurchaseUIModel[] {
    return this.dto.purchases.map((purchase) => ({
      amountCents: purchase.value,
      categoryColor: purchase.categoryIconColor
        ? normalizeCategoryColor(purchase.categoryIconColor)
        : undefined,
      categoryIcon: purchase.categoryIcon ?? FALLBACK_ICON,
      categoryName: purchase.category,
      date: parseCalendarDate(purchase.date),
      description: purchase.description,
      id: purchase.id,
    }));
  }

  get referenceMonth() {
    return this.dto.invoice.referenceMonth;
  }

  get referenceMonthDate() {
    const [year, month] = this.dto.invoice.referenceMonth
      .split("-")
      .map(Number);

    return new Date(year, month - 1, 1);
  }

  // Always an expense: negative in the day's net.
  get signedCents() {
    return -this.dto.invoice.amount;
  }

  get status() {
    return this.dto.invoice.status;
  }

  constructor(private readonly dto: CardInvoiceDTO) {}
}

// "2026-11-05" -> local Date: parsed from the string, never through a time-zone conversion.
function parseCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export default CardInvoiceUIModel;
