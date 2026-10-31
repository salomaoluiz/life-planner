import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import { InvoiceCreditKind } from "@domain/entities/financial/CardInvoiceEntity";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { InstallmentLabel } from "@screens/Financial/models/installments";
import { addMonthsTo } from "@screens/Financial/models/invoiceMonth";

import TransactionUIModel, { PendingState } from "./TransactionUIModel";

const FALLBACK_ICON = "help-circle-outline";

// A refund, a prepayment discount or an early payment as a "+" line of the invoice (spec 032 FR 27, 38).
export interface InvoiceCreditUIModel {
  accountId?: string;
  accountName?: string;
  amountCents: number;
  date: Date;
  description: string;
  id: string;
  kind: InvoiceCreditKind;
  method?: "ACCOUNT" | "EXTERNAL";
  refundedName?: string;
  refundedPlanId?: string;
  refundedTransactionId?: string;
}

// Spec 061: purchases created or edited by a running request, and the ones being deleted.
export interface InvoiceOverlay {
  added: InvoicePurchaseUIModel[];
  replaced: Map<string, InvoicePurchaseUIModel>;
  states: Map<string, PendingState>;
}

export interface InvoicePurchaseUIModel {
  amountCents: number;
  categoryColor?: string;
  categoryIcon: string;
  categoryName: string;
  date: Date;
  description: string;
  id: string;
  // Set for an installment: "k of n" (spec 030 FR 8).
  installment?: InstallmentLabel;
  // Moved into this invoice by a prepayment.
  notes?: string;
  // Spec 061: the create/edit/delete of this purchase is still running.
  pendingState?: PendingState;
  prepaid: boolean;
}

// One card invoice as a line of the transactions list (spec 029 FR 24).
class CardInvoiceUIModel {
  // What the line shows: the invoice plus the projected purchases that would land on it (spec 034 FR 14).
  get amountCents() {
    return (
      (this.dto.filtered?.filteredTotal ?? this.dto.invoice.amount) +
      this.projectedCents
    );
  }

  // Refunds and early payments can be added to an invoice that has started and has no payment record.
  get canAddCredit() {
    return (
      !this.dto.invoice.payment && this.dto.invoice.periodStart <= todayIso()
    );
  }

  // Only projections: the invoice does not exist yet, so it can't be opened or paid.
  get canOpen() {
    return !this.isProjectedOnly;
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

  // Negative credit coming from the previous invoice (cents, <= 0).
  get carryInCents() {
    return this.dto.invoice.carryIn;
  }

  // Credit left on a negative invoice, carried to the next one (cents, > 0).
  get creditCarryCents() {
    return this.dto.invoice.total < 0 ? -this.dto.invoice.total : 0;
  }

  get creditCarryMonth() {
    return addMonthsTo(this.dto.invoice.referenceMonth, 1);
  }

  get credits(): InvoiceCreditUIModel[] {
    return this.dto.credits.map((credit) => ({
      accountId: credit.accountId,
      accountName: credit.accountName,
      amountCents: credit.value,
      date: parseCalendarDate(credit.date),
      description: credit.description,
      id: credit.id,
      kind: credit.kind,
      method: credit.method,
      refundedName: credit.refundedName,
      refundedPlanId: credit.refundedPlanId,
      refundedTransactionId: credit.refundedTransactionId,
    }));
  }

  get currency() {
    return this.dto.invoice.currency;
  }

  get dateKey() {
    return this.dto.invoice.listDate;
  }

  get dates() {
    const { closingDate, dueDate, paymentDate } = this.dto.invoice;

    return { closingDate, dueDate, paymentDate };
  }

  // Σ of the early payments of the invoice (cents).
  get earlyPaidCents() {
    return this.dto.invoice.earlyPaid;
  }

  get hasPayment() {
    return !!this.dto.invoice.payment;
  }

  get id() {
    return `${this.dto.card.id}:${this.dto.invoice.referenceMonth}`;
  }

  get includesProjected() {
    return this.projectedItems.length > 0;
  }

  // The whole invoice, also when the line only shows the matching rows (spec 045).
  get invoiceTotalCents() {
    return this.dto.invoice.amount;
  }

  // Some rows of the invoice are hidden by the filters: the line shows "N of M match".
  get isPartlyMatched() {
    return this.matchedCount < this.purchaseCount;
  }

  // The invoice has no real purchases or credits: it only exists as a projection.
  get isProjectedOnly() {
    return (
      this.projectedItems.length > 0 &&
      this.dto.purchases.length === 0 &&
      this.dto.credits.length === 0 &&
      this.dto.invoice.amount === 0
    );
  }

  get lastDigits() {
    return this.dto.card.lastDigits;
  }

  get listDate() {
    return parseCalendarDate(this.dto.invoice.listDate);
  }

  // Rows of the invoice that match the filters (spec 045); all of them when the list is not filtered.
  get matchedCount() {
    return (
      this.dto.filtered?.matchedCount ??
      this.dto.purchases.length + this.dto.credits.length
    );
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

  get previousMonth() {
    return addMonthsTo(this.dto.invoice.referenceMonth, -1);
  }

  get projectedCents() {
    return this.projectedItems.reduce((sum, item) => sum + item.amountCents, 0);
  }

  // Every row of the invoice, matching or not (spec 045).
  get purchaseCount() {
    return (
      this.dto.filtered?.purchaseCount ??
      this.dto.purchases.length + this.dto.credits.length
    );
  }

  get purchaseIds() {
    return this.dto.purchases.map((purchase) => purchase.id);
  }

  get purchases(): InvoicePurchaseUIModel[] {
    const stored = this.dto.purchases.map((purchase) => ({
      amountCents: purchase.value,
      categoryColor: purchase.categoryIconColor
        ? normalizeCategoryColor(purchase.categoryIconColor)
        : undefined,
      categoryIcon: purchase.categoryIcon ?? FALLBACK_ICON,
      categoryName: purchase.category,
      date: parseCalendarDate(purchase.date),
      description: purchase.description,
      id: purchase.id,
      installment:
        purchase.installmentNumber && purchase.installmentCount
          ? {
              count: purchase.installmentCount,
              number: purchase.installmentNumber,
            }
          : undefined,
      notes: purchase.notes,
      prepaid: !!purchase.prepaid,
    }));
    const { added, replaced, states } = this.overlay;

    return [
      ...stored.map(
        (purchase) =>
          replaced.get(purchase.id) ??
          (states.has(purchase.id)
            ? { ...purchase, pendingState: states.get(purchase.id) }
            : purchase),
      ),
      ...added,
    ];
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

  // Always an expense: negative in the day's net. Projections do not move the net.
  get signedCents() {
    return -(this.dto.filtered?.filteredTotal ?? this.dto.invoice.amount);
  }

  get status() {
    return this.dto.invoice.status;
  }

  constructor(
    private readonly dto: CardInvoiceDTO,
    readonly projectedItems: TransactionUIModel[] = [],
    private readonly overlay: InvoiceOverlay = {
      added: [],
      replaced: new Map(),
      states: new Map(),
    },
  ) {}

  // The same invoice line with the pending purchases of running requests (spec 061).
  withOverlay(overlay: InvoiceOverlay, projectedItems = this.projectedItems) {
    return new CardInvoiceUIModel(this.dto, projectedItems, overlay);
  }

  // The same invoice line with the projected purchases of its month.
  withProjected(items: TransactionUIModel[]) {
    return new CardInvoiceUIModel(this.dto, items, this.overlay);
  }
}

// "2026-11-05" -> local Date: parsed from the string, never through a time-zone conversion.
function parseCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function todayIso() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default CardInvoiceUIModel;
