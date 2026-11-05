import { ChartCard, LineChart, SegmentedControl, Text } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";

import { OverviewViewModel } from "../hooks/useOverviewViewModel";
import balanceSeriesModel from "../models/balanceSeriesModel";
import blockState from "../models/blockState";
import { formatDay, formatTick } from "../models/overviewFormat";
import { todayIndex } from "../models/overviewPeriod";
import overviewTestIds from "../testIds";
import BalancePointDetail from "./BalancePointDetail";

const BUCKET_KEYS = {
  DAY: "financial.overview.bucket.day",
  MONTH: "financial.overview.bucket.month",
  WEEK: "financial.overview.bucket.week",
} as const;
const GRANULARITY_KEYS = {
  DAY: "financial.overview.granularity.day",
  MONTH: "financial.overview.granularity.month",
  WEEK: "financial.overview.granularity.week",
} as const;
const HINT_KEYS = {
  day: "financial.overview.granularity.dayHint",
  week: "financial.overview.granularity.weekHint",
} as const;

// Balance over time (spec 046 FR 12): a line per bucket, the projected part dashed, the detail of the chosen point below.
// With a favorite account (spec 094) the chart draws it as its own thick line over a muted total line.
function BalanceBlock(props: { compact: boolean; vm: OverviewViewModel }) {
  const { compact, vm } = props;
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const currency = vm.currency as CurrencyCode;
  const points = vm.balance.data?.points ?? [];
  const granularity = vm.effectiveGranularity;
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  const model = balanceSeriesModel({
    favoriteId: vm.favorite?.id,
    granularity,
    locale: localeTag,
    points,
  });
  // The favorite is highlighted only when the series has values for it.
  const favorite = model.favorite ? vm.favorite : undefined;
  // Mobile opens on today's bucket (the last realized one).
  const defaultIndex = Math.max(
    0,
    points.findIndex((point) => point.projected) - 1,
  );
  const selected = vm.selectedPoint ?? (compact ? defaultIndex : undefined);
  const point = selected === undefined ? undefined : points[selected];
  const hints = vm.granularityOptions
    .filter((option) => !option.enabled && option.hintKey)
    .map((option) => t(HINT_KEYS[option.hintKey as "day" | "week"]));
  const first = points[0];
  const last = points[points.length - 1];
  const bucketName = t(BUCKET_KEYS[granularity]);
  // The realized point of today (the line goes dashed from there), only when today is inside the period.
  const marker = todayIndex(points, vm.today);

  function describe() {
    if (!first || !last) {
      return t("financial.overview.balance.title");
    }
    if (favorite && model.favorite && model.total) {
      return t("financial.overview.a11y.balanceChartFavorite", {
        end: money(model.favorite.end),
        from: formatDay(first.start, localeTag),
        name: favorite.name,
        start: money(model.favorite.start),
        to: formatDay(last.end, localeTag),
        totalEnd: money(model.total.end),
        totalStart: money(model.total.start),
      });
    }

    return t("financial.overview.a11y.balanceChart", {
      end: money(last.balance),
      from: formatDay(first.start, localeTag),
      projected: money(last.balance),
      start: money(first.balance),
      to: formatDay(last.end, localeTag),
    });
  }

  return (
    <ChartCard
      actions={
        <SegmentedControl
          accessibilityLabel={t("financial.overview.balance.title")}
          onChange={(value) =>
            vm.onGranularityChange(value as typeof granularity)
          }
          options={vm.granularityOptions
            .filter((option) => option.enabled)
            .map((option) => ({
              label: t(GRANULARITY_KEYS[option.value]),
              value: option.value,
            }))}
          testID="financial.overview.granularity"
          value={granularity}
        />
      }
      errorText={t("financial.overview.blockError")}
      footnote={t("financial.overview.balance.filtersNote")}
      legend={
        favorite
          ? [
              {
                icon: "star",
                label: t("financial.overview.balance.favoriteLegend", {
                  name: favorite.name,
                }),
                tone: "income",
              },
              {
                label: t("financial.overview.balance.totalLegend"),
                tone: "accent",
              },
              {
                dashed: true,
                label: t("financial.overview.balance.projected"),
                tone: "neutral",
              },
            ]
          : [
              {
                label: t("financial.overview.balance.realized"),
                tone: "neutral",
              },
              {
                dashed: true,
                label: t("financial.overview.balance.projected"),
                tone: "neutral",
              },
            ]
      }
      onRetry={vm.balance.refetch}
      retryLabel={t("financial.overview.retry")}
      state={
        vm.noTransactions && points.length === 0
          ? "empty"
          : blockState(vm.balance)
      }
      subtitle={t("financial.overview.balance.subtitle", {
        bucket: bucketName,
      })}
      testID={overviewTestIds.balanceChart}
      title={t("financial.overview.balance.title")}
    >
      <LineChart
        accessibilityLabel={describe()}
        formatTick={(value) => formatTick(value, localeTag, currency, compact)}
        formatValue={money}
        onSelect={vm.setSelectedPoint}
        selectedIndex={selected}
        series={model.series}
        testID="financial.overview.balance-line"
        today={
          marker === undefined
            ? undefined
            : { index: marker, label: t("financial.overview.today") }
        }
      />
      {hints.length > 0 ? (
        <Text.Caption tone="secondary" value={hints.join(" · ")} />
      ) : null}
      {point ? (
        <BalancePointDetail
          compact={compact}
          favoriteId={favorite?.id}
          localeTag={localeTag}
          money={money}
          point={point}
        />
      ) : null}
    </ChartCard>
  );
}

export default BalanceBlock;
