import { LineChartPoint } from "@components/LineChart";
import {
  InvestmentOperationType,
  InvestmentPriceKind,
} from "@domain/entities/investment/enums";
import {
  InvestmentOperation,
  InvestmentPriceHistory,
} from "@domain/entities/investment/InvestmentEntities";

export type ChartMode = "position" | "price";

// Date label of the axis: `YYYY-MM-DD` -> "04/11" (day and month, locale order).
export function axisLabel(day: string, localeTag: string): string {
  const [year, month, date] = day.split("-").map(Number);

  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

// Spec 104 FR 16, 29: one point per day of the history. Points that are not a stored close (an operation or a manual
// value, before the history starts) are drawn dashed. "Position in BRL" multiplies by the quantity held and by the
// exchange rate of that day (points without a rate are left out of that mode).
export function buildChartPoints(
  history: InvestmentPriceHistory | undefined,
  mode: ChartMode,
  operations: InvestmentOperation[],
  formatDate: (day: string) => string,
): LineChartPoint[] {
  if (!history) {
    return [];
  }

  return history.points.flatMap((point) => {
    const price = Number(point.price);
    let value: number | undefined = price;

    if (mode === "position") {
      value =
        point.fxRate === null
          ? undefined
          : price * quantityOn(operations, point.date) * Number(point.fxRate);
    }

    if (value === undefined || !Number.isFinite(value)) {
      return [];
    }

    return [
      {
        label: formatDate(point.date),
        projected: point.kind !== InvestmentPriceKind.CLOSE,
        value,
      },
    ];
  });
}

// A day of purchase inside the drawn history, for the legend sentence.
export function hasOperationPoints(
  history: InvestmentPriceHistory | undefined,
): boolean {
  return (
    history?.points.some(
      (point) => point.kind === InvestmentPriceKind.OPERATION,
    ) ?? false
  );
}

// Quantity held on `day`, from the operations on or before it (a chart needs no exact decimals).
export function quantityOn(
  operations: InvestmentOperation[],
  day: string,
): number {
  return operations
    .filter((operation) => operation.date <= day)
    .reduce(
      (total, operation) =>
        total +
        (operation.type === InvestmentOperationType.BUY ? 1 : -1) *
          Number(operation.quantity),
      0,
    );
}
