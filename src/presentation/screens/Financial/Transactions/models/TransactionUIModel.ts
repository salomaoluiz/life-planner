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
    return !this.dto.paid && !this.dto.creditCardId && !this.dto.systemKey;
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

  get ownerId() {
    return this.dto.ownerId;
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
    private readonly dto: TransactionDTO,
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
