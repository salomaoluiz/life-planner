import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { BALANCE_ADJUSTMENT } from "@domain/entities/financial/TransactionEntity";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { decimalStringToCents } from "@utils/money";
import { computeRate } from "@utils/transferRate";

// Spec 061: a row whose create/edit ("saving") or delete ("deleting") request is still running.
export type PendingState = "deleting" | "saving";

const FALLBACK_ICON = "help-circle-outline";
const ADJUSTMENT_ICON = "scale-balance";

class TransactionUIModel {
  get accountId() {
    return this.dto.accountId;
  }

  get accountName() {
    return this.dto.accountName ?? "";
  }

  get amountCents() {
    return decimalStringToCents(this.dto.value);
  }

  get amountType(): "EXPENSE" | "INCOME" {
    return this.isExpense ? "EXPENSE" : "INCOME";
  }

  // Account rows that are not settled yet and are not system rows: the list offers the pay button.
  get canPay() {
    return (
      !this.dto.paid &&
      !this.dto.creditCardId &&
      (!this.dto.systemKey ||
        this.transferSide === "IN" ||
        this.transferSide === "OUT") &&
      !this.dto.isProjected
    );
  }

  get categoryColor() {
    // An adjustment has no category: neutral tile.
    if (this.isAdjustment) {
      return undefined;
    }

    const color = this.category?.iconColor;

    // No category: undefined, so the tile renders neutral like on Home (spec 015 FR 10).
    return color ? normalizeCategoryColor(color) : undefined;
  }

  get categoryIcon() {
    if (this.isAdjustment) {
      return ADJUSTMENT_ICON;
    }

    return this.category?.icon ?? FALLBACK_ICON;
  }

  get categoryName() {
    return this.dto.categoryName ?? this.dto.category;
  }

  // "3/10" next to the description of a series with an end date; none without one (spec 034 FR 13).
  get counter() {
    return this.dto.occurrenceNumber && this.dto.occurrenceCount
      ? `${this.dto.occurrenceNumber}/${this.dto.occurrenceCount}`
      : undefined;
  }

  get currency() {
    return this.dto.currency;
  }

  // Computed once: the list reads it while it filters, sorts and groups.
  get date() {
    this.cachedDate ??= new Date(this.dto.date);

    return this.cachedDate;
  }

  get dateKey() {
    if (this.cachedDateKey === undefined) {
      const date = this.date;

      this.cachedDateKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    return this.cachedDateKey;
  }

  get description() {
    return this.dto.description;
  }

  // The frequency label of a series WITHOUT an end date (the list shows it instead of a counter).
  get frequency() {
    return this.dto.recurrenceId && !this.dto.occurrenceCount
      ? this.dto.recurrenceFrequency
      : undefined;
  }

  get id() {
    return this.dto.id;
  }

  get isAdjustment() {
    return this.dto.systemKey === BALANCE_ADJUSTMENT;
  }

  // A purchase on a card: shown inside its invoice line, never as an account row.
  get isCardPurchase() {
    return !!this.dto.creditCardId;
  }

  get isExpense() {
    return this.dto.type === "EXPENSE";
  }

  // Unpaid and already past: flagged in the list (spec 033 FR 7).
  get isOverdue() {
    return this.canPay && this.dateKey < todayKey();
  }

  // Stored status of an account row (spec 033); a projected occurrence is never paid.
  get isPaid() {
    return !!this.dto.paid;
  }

  get isPending() {
    return !!this.pendingState;
  }

  // An occurrence of a series that has no stored row yet: muted, no pay button (spec 034 FR 14).
  get isProjected() {
    return !!this.dto.isProjected;
  }

  get isRecurring() {
    return !!this.dto.recurrenceId;
  }

  // Spec 098: the row belongs to a transfer (out, in or fee).
  get isTransfer() {
    return !!this.dto.transferId;
  }

  // The out row of a transfer between currencies whose amount in is still to be informed (series occurrence).
  get isTransferAmountPending() {
    const transfer = this.dto.transfer;

    return (
      this.transferSide === "OUT" &&
      !!transfer &&
      !transfer.counterpartHidden &&
      transfer.currencyIn !== transfer.currencyOut &&
      transfer.amountIn === undefined
    );
  }

  // The caller reads only one side of the transfer: the row is read-only ("Conta de outro dono").
  get isTransferReadOnly() {
    return this.dto.transfer?.counterpartHidden === true;
  }

  // `YYYY-MM` of the day the row is shown on.
  get monthKey() {
    return this.dateKey.slice(0, 7);
  }

  // Spec 059: the free-text note of a normal transaction, when it has one.
  get notes() {
    return this.dto.notes;
  }

  get occurrenceNumber() {
    return this.dto.occurrenceNumber;
  }

  get ownerId() {
    return this.dto.ownerId;
  }

  get recurrenceId() {
    return this.dto.recurrenceId;
  }

  get signedCents() {
    return this.isExpense ? -this.amountCents : this.amountCents;
  }

  get subtitle() {
    if (this.isAdjustment) {
      return this.accountName;
    }

    return [this.categoryName, this.accountName].filter(Boolean).join(" · ");
  }

  // The rate shown on the in row of a transfer between currencies: `{ value, currency }` reads "value <currency of the
  // out side> per <unit>" (spec 098 FR 5).
  get transferRate() {
    const transfer = this.dto.transfer;

    if (
      this.transferSide !== "IN" ||
      !transfer?.amountOut ||
      !transfer.amountIn ||
      transfer.currencyIn === transfer.currencyOut
    ) {
      return undefined;
    }
    const rate = computeRate(
      decimalStringToCents(transfer.amountOut),
      decimalStringToCents(transfer.amountIn),
    );

    return rate
      ? {
          // IN base: 1 <in> = value <out>; OUT base: 1 <out> = value <in>.
          currency:
            rate.base === "IN" ? transfer.currencyIn : transfer.currencyOut,
          perCurrency:
            rate.base === "IN" ? transfer.currencyOut : transfer.currencyIn,
          value: rate.value,
        }
      : undefined;
  }

  get transferSide(): "FEE" | "IN" | "OUT" | undefined {
    if (!this.dto.transferId) {
      return undefined;
    }
    if (this.dto.systemKey === "TRANSFER_OUT") {
      return "OUT";
    }
    if (this.dto.systemKey === "TRANSFER_IN") {
      return "IN";
    }

    return this.dto.systemKey === "TRANSFER_FEE" ? "FEE" : undefined;
  }

  private cachedDate?: Date;

  private cachedDateKey?: string;

  constructor(
    readonly dto: TransactionDTO,
    private readonly category?: CategoryDTO,
    readonly pendingState?: PendingState,
  ) {}

  withPendingState(state: PendingState) {
    return new TransactionUIModel(this.dto, this.category, state);
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function todayKey() {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default TransactionUIModel;
