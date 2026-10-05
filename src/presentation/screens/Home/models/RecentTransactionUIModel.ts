import RecentTransactionDTO from "@application/dto/home/RecentTransactionDTO";
import { TranslationKeys } from "@presentation/i18n/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

class RecentTransactionUIModel {
  get amount() {
    return {
      type: (this.dto.type === "INCOME" ? "INCOME" : "EXPENSE") as
        | "EXPENSE"
        | "INCOME",
      value: this.dto.value,
    };
  }

  get categoryColor() {
    return this.dto.categoryColor;
  }

  get categoryIcon() {
    return this.dto.categoryIcon;
  }

  get categoryName() {
    return this.dto.categoryName;
  }

  get dateKey(): TranslationKeys | undefined {
    const days = Math.round(
      (startOfDay(this.now) - startOfDay(new Date(this.dto.date))) / MS_PER_DAY,
    );

    if (days === 0) return "common.date.today";
    if (days === 1) return "common.date.yesterday";
    return undefined;
  }

  get dateText() {
    return new Intl.DateTimeFormat(this.languageTag, {
      day: "numeric",
      month: "short",
    }).format(new Date(this.dto.date));
  }

  get id() {
    return this.dto.id;
  }

  get title() {
    return this.dto.description;
  }

  constructor(
    private readonly dto: RecentTransactionDTO,
    private readonly now: Date,
    private readonly languageTag: string,
  ) {}
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export default RecentTransactionUIModel;
