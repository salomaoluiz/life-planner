import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { decimalStringToCents } from "@utils/money";

const FALLBACK_ICON = "help-circle-outline";

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

  get categoryColor() {
    return normalizeCategoryColor(this.category?.iconColor ?? "black");
  }

  get categoryIcon() {
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

  get isExpense() {
    return this.dto.type === "EXPENSE";
  }

  get ownerId() {
    return this.dto.ownerId;
  }

  get signedCents() {
    return this.isExpense ? -this.amountCents : this.amountCents;
  }

  get subtitle() {
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

export default TransactionUIModel;
