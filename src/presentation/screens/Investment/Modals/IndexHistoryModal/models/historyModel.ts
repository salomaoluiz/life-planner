import { InvestmentMarketIndexHistory } from "@domain/entities/investment/InvestmentEntities";
import { percentLabel } from "@screens/Investment/Settings/models/settingsModel";

type HistoryPeriod = "5y" | "6m" | "12m" | "first";

const HISTORY_PERIODS: HistoryPeriod[] = ["6m", "12m", "5y", "first"];
// The API refuses a period over 30 years: "since the first title" shows the whole stored history.
const MAX_YEARS = 30;

interface ChartPoint {
  label: string;
  projected: false;
  value: number;
}

// What the chart draws: the annual value of each step (CDI, Selic) or the monthly IPCA of each month.
function chartPoints(
  history: InvestmentMarketIndexHistory,
  labelOf: (value: string) => string,
): ChartPoint[] {
  return history.points.flatMap((point) => {
    const raw = point.value ?? point.monthly;
    const at = point.date ?? point.month;

    return raw === undefined || at === undefined
      ? []
      : [{ label: labelOf(at), projected: false as const, value: Number(raw) }];
  });
}

// "+0,75" / "−0,50"; the first change of a period has no delta.
function deltaLabel(delta: null | string, localeTag: string): string {
  if (delta === null) {
    return "—";
  }

  const text = percentLabel(String(Math.abs(Number(delta))), 2, localeTag);

  return `${Number(delta) < 0 ? "−" : "+"}${text}`;
}

// `[from, to]` of a period ending today, as `YYYY-MM-DD`.
function historyRange(
  period: HistoryPeriod,
  today: string,
): { from: string; to: string } {
  const [year, month, day] = today.split("-").map(Number);
  const months = { "5y": 60, "6m": 6, "12m": 12, first: MAX_YEARS * 12 }[
    period
  ];
  const start = new Date(Date.UTC(year, month - 1 - months, 1));
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const from = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      Math.min(day, lastDay),
    ),
  );

  return { from: from.toISOString().slice(0, 10), to: today };
}

export type { ChartPoint, HistoryPeriod };
export { chartPoints, deltaLabel, HISTORY_PERIODS, historyRange };
