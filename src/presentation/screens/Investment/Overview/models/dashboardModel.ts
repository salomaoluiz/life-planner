import {
  formatAmount,
  numberLocale,
} from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
import {
  InvestmentDashboard,
  InvestmentDashboardBucket,
  InvestmentDashboardIncomeBucket,
  InvestmentDashboardRankingRow,
  InvestmentValueKind,
} from "@domain/entities/investment/InvestmentEntities";
import { TranslationKeys } from "@presentation/i18n/types";
import { investmentClassColor } from "@presentation/theme/constants";
import {
  compactAmount,
  formatBucketLabel,
  formatDay,
  formatTick,
  percentOf,
} from "@screens/Financial/Overview/models/overviewFormat";

import { INVESTMENTS_PRESETS, InvestmentsPreset } from "./investmentsPeriod";

export const RANKING_PAGE = 10;

export interface DashboardAllocationRowUI {
  assetClass: InvestmentAssetClass;
  label: string;
  percent: string;
  pressed: boolean;
  share: number;
  swatch: string;
  valueText: string;
}

export interface DashboardAllocationUI {
  centerLabel: string;
  centerValue: string;
  legend: string;
  rows: DashboardAllocationRowUI[];
}

export interface DashboardIncomeRowUI {
  byType: InvestmentIncomeType[];
  label: string;
  planned: number;
  received: number;
  receivedText: string;
}

export interface DashboardRankingRowUI {
  assetId: string;
  barShare: number;
  name: string;
  resultPercent: string;
  resultText: string;
  subline: string;
  swatch: string;
  ticker: string;
  tone: "expense" | "income";
  valueText: string;
}

export interface DashboardRankingUI {
  rows: DashboardRankingRowUI[];
  total: number;
}

export interface DashboardTile {
  caption?: string;
  label: string;
  testID: string;
  tone?: "expense" | "income";
  value: string;
}

type TranslateLike = (
  key: TranslationKeys,
  options?: Record<string, unknown>,
) => string;

export function seriesLabels(
  dashboard: InvestmentDashboard,
  localeTag: string,
): string[] {
  const granularity = bucketUnitKey(dashboard.period.bucket).toUpperCase() as
    | "DAY"
    | "MONTH"
    | "WEEK";

  return dashboard.series.map((point) =>
    formatBucketLabel(point.date, granularity, localeTag),
  );
}

// The labels of the classes match the asset list (spec 102); fixed income reads "net" here (spec 110 FR 15).
export const CLASS_LABEL_KEYS: Record<InvestmentAssetClass, TranslationKeys> = {
  BR_REIT: "investment.classGroup.BR_REIT",
  BR_STOCK: "investment.classGroup.BR_STOCK",
  FIXED_INCOME: "investment.overview.allocation.fixedIncome",
  FOREIGN_STOCK: "investment.classGroup.FOREIGN_STOCK",
  PRIVATE: "investment.classGroup.PRIVATE",
};

export function bucketUnitKey(
  bucket: InvestmentDashboardBucket,
): "day" | "month" | "week" {
  if (bucket === InvestmentDashboardBucket.DAY) {
    return "day";
  }

  return bucket === InvestmentDashboardBucket.WEEK ? "week" : "month";
}

export function buildAllocation(input: {
  dashboard: InvestmentDashboard;
  isDark: boolean;
  localeTag: string;
  selected?: InvestmentAssetClass;
  t: TranslateLike;
}): DashboardAllocationUI {
  const { dashboard, isDark, localeTag, selected, t } = input;
  const rows = dashboard.allocation.map((row) => ({
    assetClass: row.assetClass,
    label: t(CLASS_LABEL_KEYS[row.assetClass]),
    percent: percentOf(row.value, dashboard.summary.currentValue, localeTag),
    pressed: row.assetClass === selected,
    share: row.share,
    swatch: investmentClassColor(isDark, row.assetClass),
    valueText: formatAmount(row.value, localeTag, "BRL"),
  }));
  const current = dashboard.allocation.find(
    (row) => row.assetClass === selected,
  );

  return {
    centerLabel: current
      ? t(CLASS_LABEL_KEYS[current.assetClass])
      : t("investment.overview.allocation.total"),
    centerValue: current
      ? percentOf(current.value, dashboard.summary.currentValue, localeTag)
      : compactAmount(dashboard.summary.currentValue, localeTag, "BRL"),
    legend: t("investment.overview.allocation.legend", {
      count: rows.length,
      total: formatAmount(dashboard.summary.currentValue, localeTag, "BRL"),
    }),
    rows,
  };
}

export function buildIncome(input: {
  buckets: InvestmentDashboardIncomeBucket[];
  dashboard: InvestmentDashboard;
  localeTag: string;
}): DashboardIncomeRowUI[] {
  const unit = bucketUnitKey(input.dashboard.period.bucket);
  const granularity = unit.toUpperCase() as "DAY" | "MONTH" | "WEEK";

  return input.buckets.map((bucket) => ({
    byType: Object.values(InvestmentIncomeType).filter(
      (type) => bucket.byType[type] > 0,
    ),
    label: formatBucketLabel(bucket.date, granularity, input.localeTag),
    planned: bucket.planned,
    received: bucket.received,
    receivedText: formatAmount(bucket.received, input.localeTag, "BRL"),
  }));
}

export function buildRanking(input: {
  dashboard: InvestmentDashboard;
  expanded: boolean;
  isDark: boolean;
  localeTag: string;
  selected?: InvestmentAssetClass;
  t: TranslateLike;
}): DashboardRankingUI {
  const filtered = filterRanking(input.dashboard.ranking, input.selected);
  const shown = visibleRanking(filtered, input.expanded);
  const largest = filtered[0]?.value ?? 0;
  const total = input.dashboard.summary.currentValue;

  return {
    rows: shown.map((row) => {
      const shareText = percentOf(row.value, total, input.localeTag);

      return {
        assetId: row.assetId,
        barShare: largest === 0 ? 0 : row.value / largest,
        name: row.name,
        resultPercent:
          row.openResultPercent === undefined
            ? ""
            : `${row.openResultPercent >= 0 ? "+" : "−"}${percentText(Math.abs(row.openResultPercent), input.localeTag)}`,
        resultText: signText(row.openResult, input.localeTag, "BRL"),
        subline: rankingSubline(row, shareText, input.t),
        swatch: investmentClassColor(input.isDark, row.assetClass),
        ticker: row.ticker ?? row.name,
        tone: row.openResult < 0 ? "expense" : "income",
        valueText: formatAmount(row.value, input.localeTag, "BRL"),
      };
    }),
    total: filtered.length,
  };
}

export function buildTiles(input: {
  currency: CurrencyCode;
  dashboard: InvestmentDashboard;
  localeTag: string;
  t: TranslateLike;
}): DashboardTile[] {
  const { summary } = input.dashboard;
  const { currency, localeTag, t } = input;
  const openTone = toneOf(summary.openResult);
  const realizedTone = toneOf(summary.realizedResult);

  return [
    {
      caption: t("investment.overview.tiles.currentValueCaption", {
        date: formatDay(input.dashboard.period.to, localeTag),
      }),
      label: t("investment.overview.tiles.currentValue"),
      testID: "investment.overview.tile-current-value",
      value: formatAmount(summary.currentValue, localeTag, currency),
    },
    {
      caption: t("investment.overview.tiles.investedCaption"),
      label: t("investment.overview.tiles.invested"),
      testID: "investment.overview.tile-invested",
      value: formatAmount(summary.invested, localeTag, currency),
    },
    {
      caption:
        summary.openResultPercent === undefined
          ? undefined
          : t("investment.overview.tiles.openResultCaption", {
              percent: percentText(summary.openResultPercent, localeTag),
            }),
      label: t("investment.overview.tiles.openResult"),
      testID: "investment.overview.tile-open-result",
      tone: openTone,
      value: signText(summary.openResult, localeTag, currency),
    },
    {
      caption: t(
        `investment.overview.ranking.sells_${summary.salesCount === 1 ? "one" : "other"}`,
        { count: summary.salesCount },
      ),
      label: t("investment.overview.tiles.realized"),
      testID: "investment.overview.tile-realized",
      tone: realizedTone,
      value: signText(summary.realizedResult, localeTag, currency),
    },
    {
      caption:
        summary.incomePlanned === 0
          ? t("investment.overview.tiles.incomeReceived")
          : `${t("investment.overview.tiles.incomeReceived")} · ${t(
              "investment.overview.tiles.incomePlanned",
              {
                amount: formatAmount(
                  summary.incomePlanned,
                  localeTag,
                  currency,
                ),
              },
            )}`,
      label: t("investment.overview.tiles.income"),
      testID: "investment.overview.tile-income",
      tone: summary.incomeReceived > 0 ? "income" : undefined,
      value: formatAmount(summary.incomeReceived, localeTag, currency),
    },
  ];
}

export function filterRanking(
  rows: InvestmentDashboardRankingRow[],
  selected?: InvestmentAssetClass,
): InvestmentDashboardRankingRow[] {
  return selected ? rows.filter((row) => row.assetClass === selected) : rows;
}

export function percentText(fraction: number, localeTag: string): string {
  return `${new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 2,
  }).format(fraction * 100)}%`;
}

export function presets(): InvestmentsPreset[] {
  return INVESTMENTS_PRESETS;
}

// The second line of a ranking row: the US$ value, the value note and the share (spec 110 FR 19).
export function rankingSubline(
  row: InvestmentDashboardRankingRow,
  shareText: string,
  t: TranslateLike,
): string {
  const notes: Record<InvestmentValueKind, string | undefined> = {
    COST: t("investment.overview.ranking.costValue"),
    FIXED_INCOME_NET: t("investment.overview.ranking.fixedIncomeNet"),
    MANUAL: t("investment.overview.ranking.manualValue"),
    QUOTE: undefined,
  };

  return [
    row.usdValue ? `US$ ${row.usdValue}` : undefined,
    notes[row.valueKind],
    shareText,
  ]
    .filter(Boolean)
    .join(" · ");
}

// "+ R$ 21.420,55" / "− R$ 312,40": the sign carries the direction (spec 110 FR 11).
export function signText(
  cents: number,
  localeTag: string,
  currency: CurrencyCode,
): string {
  if (cents === 0) {
    return formatAmount(0, localeTag, currency);
  }

  return `${cents > 0 ? "+" : "−"} ${formatAmount(Math.abs(cents), localeTag, currency)}`;
}

// The tone of a result: income when positive, expense when negative, no tint at zero.
export function toneOf(value: number): "expense" | "income" | undefined {
  if (value === 0) {
    return undefined;
  }

  return value > 0 ? "income" : "expense";
}

export function visibleRanking(
  rows: InvestmentDashboardRankingRow[],
  expanded: boolean,
): InvestmentDashboardRankingRow[] {
  return expanded ? rows : rows.slice(0, RANKING_PAGE);
}

export { formatTick };
