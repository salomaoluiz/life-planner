import UpcomingDTO, {
  UpcomingItemDTO,
} from "@application/dto/home/UpcomingDTO";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type UpcomingBadgeTone = "expense" | "income" | "warning";

class UpcomingUIModel {
  get isEmpty() {
    return this.dto.overdue.length === 0 && this.dto.next.length === 0;
  }

  get next() {
    return {
      count: this.dto.nextTotal,
      rows: this.dto.next.map(
        (item) => new UpcomingRowUIModel(item, this.now, this.languageTag),
      ),
    };
  }

  get overdue() {
    return {
      count: this.dto.overdue.length,
      expenseTotal: this.dto.overdueExpenseCents,
      rows: this.dto.overdue.map(
        (item) => new UpcomingRowUIModel(item, this.now, this.languageTag),
      ),
    };
  }

  constructor(
    private readonly dto: UpcomingDTO,
    private readonly now: Date,
    private readonly languageTag: string,
  ) {}
}

// One row of the upcoming list: a transaction, a whole card invoice or a recurrence projection (spec 062 FR 13-15).
export class UpcomingRowUIModel {
  get amount() {
    return {
      type: this.item.type,
      value: this.item.valueCents,
    };
  }

  get badge():
    | undefined
    | {
        key: TranslationKeys;
        params?: { count: number };
        tone: UpcomingBadgeTone;
      } {
    if (this.overdueDays > 0) {
      return {
        key: pluralKey("home.upcoming.overdueDays", this.overdueDays),
        params: { count: this.overdueDays },
        tone: "expense",
      };
    }
    if (this.item.kind === "PROJECTION") {
      return { key: "home.upcoming.projected", tone: "warning" };
    }
    if (this.item.kind !== "INVOICE" && this.item.type === "INCOME") {
      return { key: "home.upcoming.toReceive", tone: "income" };
    }

    return undefined;
  }

  get currency() {
    return this.item.currency as CurrencyCode;
  }

  get dateText() {
    return new Intl.DateTimeFormat(this.languageTag, {
      day: "numeric",
      month: "short",
    }).format(toDate(this.item.date));
  }

  get icon() {
    if (this.item.kind === "INVOICE") return "credit-card-outline";
    if (this.item.kind === "PROJECTION") return "repeat";

    return this.item.type === "INCOME" ? "arrow-up" : "arrow-down";
  }

  get id() {
    return this.item.id;
  }

  get isInvoice() {
    return this.item.kind === "INVOICE";
  }

  get overdueDays() {
    return Math.max(
      0,
      Math.round(
        (startOfDay(this.now) - startOfDay(toDate(this.item.date))) /
          MS_PER_DAY,
      ),
    );
  }

  get purchaseCount() {
    return this.item.purchaseCount ?? 0;
  }

  get tone(): "expense" | "income" | "neutral" | "warning" {
    if (this.item.kind === "INVOICE") return "neutral";
    if (this.item.kind === "PROJECTION") return "warning";

    return this.item.type === "INCOME" ? "income" : "expense";
  }

  get value() {
    return this.item;
  }

  constructor(
    private readonly item: UpcomingItemDTO,
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

// `YYYY-MM-DD` as a local calendar day.
function toDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export default UpcomingUIModel;
