import { View } from "react-native";

import { ChartCard, LineChart, SegmentedControl, Text } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";

import { OverviewViewModel } from "../hooks/useOverviewViewModel";
import blockState from "../models/blockState";
import {
  formatBucketLabel,
  formatDay,
  formatTick,
} from "../models/overviewFormat";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

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
function BalanceBlock(props: { compact: boolean; vm: OverviewViewModel }) {
  const { compact, vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const currency = vm.currency as CurrencyCode;
  const series = vm.balance.data;
  const points = series?.points ?? [];
  const granularity = vm.effectiveGranularity;
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
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
      legend={[
        { label: t("financial.overview.balance.realized"), tone: "neutral" },
        {
          dashed: true,
          label: t("financial.overview.balance.projected"),
          tone: "neutral",
        },
      ]}
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
        accessibilityLabel={
          first && last
            ? t("financial.overview.a11y.balanceChart", {
                end: money(last.balance),
                from: formatDay(first.start, localeTag),
                projected: money(last.balance),
                start: money(first.balance),
                to: formatDay(last.end, localeTag),
              })
            : t("financial.overview.balance.title")
        }
        formatTick={(value) => formatTick(value, localeTag, currency, compact)}
        formatValue={money}
        onSelect={vm.setSelectedPoint}
        points={points.map((item, index) => {
          const label = formatBucketLabel(item.start, granularity, localeTag);

          return {
            accessibilityLabel: formatDay(item.end, localeTag),
            // The projected rest of the current bucket repeats its label: the axis shows it once.
            label:
              index > 0 &&
              label ===
                formatBucketLabel(
                  points[index - 1].start,
                  granularity,
                  localeTag,
                )
                ? ""
                : label,
            projected: item.projected,
            value: item.balance,
          };
        })}
        selectedIndex={selected}
        testID="financial.overview.balance-line"
      />
      {hints.length > 0 ? (
        <Text.Caption tone="secondary" value={hints.join(" · ")} />
      ) : null}
      {point ? (
        <View style={styles.detail} testID={overviewTestIds.balanceDetail}>
          <Text.Caption
            tone="secondary"
            value={t("financial.overview.balance.detailTitle", {
              label: `${formatDay(point.start, localeTag)}${point.start === point.end ? "" : ` – ${formatDay(point.end, localeTag)}`}`,
              total: money(point.balance),
            })}
          />
          {point.accounts.map((account) => (
            <View key={account.id} style={styles.detailRow}>
              <Text.Caption tone="secondary" value={account.name} />
              <Text.Caption tabular value={money(account.balance)} />
            </View>
          ))}
        </View>
      ) : null}
    </ChartCard>
  );
}

export default BalanceBlock;
