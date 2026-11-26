import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import {
  WasteCurrencyTotal,
  WasteEntity,
} from "@domain/entities/stock/StockWasteEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

export interface WasteBarRow {
  count: number;
  id: string;
  label: string;
  // `0..1` against the biggest row, and the share of the month ("65%").
  percent: string;
  ratio: number;
  value: string;
}

export interface WasteItemRow {
  detail: {
    count: number;
    quantity: { text: string; unitKey: TranslationKeys };
  };
  id: string;
  name: string;
  reasonKey: TranslationKeys;
  value: string;
}

export const WASTE_OWNER_ALL = "ALL";

// Spec 123 FR 29-31: the Waste screen of one month. Values are per currency and never summed across currencies;
// discards without a price count in quantity only.
class WasteUIModel {
  get byCategory(): WasteBarRow[] {
    return this.bars(
      this.waste.byCategory.map((row) => ({
        count: row.count,
        id: row.category?.id ?? "none",
        label: row.category?.name ?? "",
        totals: row.totals,
      })),
    );
  }

  get byReason(): WasteBarRow[] {
    return this.bars(
      this.waste.byReason.map((row) => ({
        count: row.count,
        id: row.reason,
        label: row.reason,
        totals: row.totals,
      })),
    );
  }

  get canGoNext() {
    return this.waste.month < this.currentMonth;
  }

  get canGoPrevious() {
    return (
      this.waste.firstMonth !== undefined &&
      this.waste.month > this.waste.firstMonth
    );
  }

  // "+R$ 12,10 que outubro" against the previous month (the first currency that has both).
  get delta():
    | undefined
    | {
        key: TranslationKeys;
        params: Record<string, string>;
        tone: "bad" | "good" | "neutral";
      } {
    const current = this.waste.totals[0];
    const before = current
      ? this.waste.previousMonth.find(
          (row) => row.currency === current.currency,
        )
      : undefined;

    if (!current || !before) {
      return undefined;
    }

    const difference = current.valueCents - before.valueCents;
    const month = this.monthName(this.previousMonthKey);

    if (difference === 0) {
      return {
        key: "stock.waste.deltaSame",
        params: { month },
        tone: "neutral",
      };
    }

    return {
      key: difference > 0 ? "stock.waste.deltaUp" : "stock.waste.deltaDown",
      params: {
        month,
        value: this.money(Math.abs(difference), current.currency),
      },
      tone: difference > 0 ? "bad" : "good",
    };
  }

  get discardCount() {
    return this.waste.summary.discardCount;
  }

  get distinctItems() {
    return this.waste.summary.itemCount;
  }

  get isEmpty() {
    return this.waste.summary.discardCount === 0;
  }

  get month() {
    return this.waste.month;
  }

  get monthLabel() {
    return this.monthName(this.waste.month, true);
  }

  get moreItemsCount() {
    return this.waste.moreItemsCount;
  }

  get nextMonthKey() {
    return shiftMonth(this.waste.month, 1);
  }

  get previousMonthKey() {
    return shiftMonth(this.waste.month, -1);
  }

  get topItems(): WasteItemRow[] {
    return this.waste.topItems.map((item) => ({
      detail: {
        count: item.count,
        quantity: formatQuantity(
          item.quantity,
          item.unit as StockUnits,
          this.locale,
        ),
      },
      id: item.itemId,
      name: item.description,
      reasonKey: reasonKey(item.mainReason),
      value: this.valueText(item.totals),
    }));
  }

  get totalValues() {
    return this.waste.totals.map((row) =>
      this.money(row.valueCents, row.currency),
    );
  }

  get unpricedCount() {
    return this.waste.summary.unpricedCount;
  }

  constructor(
    private readonly waste: WasteEntity,
    private readonly locale: string,
    private readonly currentMonth: string,
  ) {}

  // The reason keys are translated by the view (`stock.waste.reason.*`).
  reasonLabelKey(id: string): TranslationKeys {
    return reasonKey(id);
  }

  private bars(
    rows: {
      count: number;
      id: string;
      label: string;
      totals: WasteCurrencyTotal[];
    }[],
  ): WasteBarRow[] {
    // One currency: the share and the bar follow the value; otherwise the count (a value cannot be summed).
    const single =
      new Set(rows.flatMap((row) => row.totals.map((total) => total.currency)))
        .size <= 1;
    function measure(row: (typeof rows)[number]) {
      return single
        ? row.totals.reduce((sum, total) => sum + total.valueCents, 0)
        : row.count;
    }
    const total = rows.reduce((sum, row) => sum + measure(row), 0);
    const biggest = Math.max(...rows.map(measure), 0);

    return rows.map((row) => ({
      count: row.count,
      id: row.id,
      label: row.label,
      percent:
        total > 0 ? `${Math.round((measure(row) / total) * 100)}%` : "0%",
      ratio: biggest > 0 ? measure(row) / biggest : 0,
      value: this.valueText(row.totals),
    }));
  }

  private money(cents: number, currency: string) {
    return formatAmount(cents, this.locale, currency as CurrencyCode);
  }

  private monthName(key: string, withYear = false) {
    const [year, month] = key.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString(this.locale, {
      month: "long",
      ...(withYear ? { year: "numeric" } : {}),
    });
  }

  private valueText(totals: WasteCurrencyTotal[]) {
    return totals
      .map((total) => this.money(total.valueCents, total.currency))
      .join(" · ");
  }
}

export function currentMonthKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(key: string, by: number): string {
  const [year, month] = key.split("-").map(Number);
  const moved = new Date(year, month - 1 + by, 1);

  return `${moved.getFullYear()}-${String(moved.getMonth() + 1).padStart(2, "0")}`;
}

function reasonKey(reason: string): TranslationKeys {
  return `stock.waste.reason.${reason.toLowerCase()}` as TranslationKeys;
}

export default WasteUIModel;
