import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { BALANCE_ADJUSTMENT } from "@domain/entities/financial/TransactionEntity";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { decimalStringToCents } from "@utils/money";

const FALLBACK_ICON = "help-circle-outline";
const ADJUSTMENT_ICON = "scale-balance";

class TransactionUIModel {
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
      !this.dto.systemKey &&
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

  get date() {
    return new Date(this.dto.date);
  }

  get dateKey() {
    const date = this.date;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

  // An occurrence of a series that has no stored row yet: muted, no pay button (spec 034 FR 14).
  get isProjected() {
    return !!this.dto.isProjected;
  }

  get isRecurring() {
    return !!this.dto.recurrenceId;
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

  constructor(
    readonly dto: TransactionDTO,
    private readonly category?: CategoryDTO,
  ) {}
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function todayKey() {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default TransactionUIModel;
