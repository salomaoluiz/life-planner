import { View } from "react-native";

import { ChartCard, LineChart, Text, useDensity } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import blockState from "@screens/Financial/Overview/models/blockState";
import {
  formatDay,
  formatTick,
} from "@screens/Financial/Overview/models/overviewFormat";
import {
  formatMoney,
  formatResult,
  resultTone,
} from "@screens/Investment/models/format";

import { InvestmentOverviewVM } from "../hooks";
import toEvolutionSeries from "../models/seriesModel";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Spec 110 FR 12-14: market value (accent line with area) against invested (dashed), a point per bucket, the values
// of the chosen point below and the notes about empty buckets and prices that come from operations.
function EvolutionBlock(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const data = vm.dashboard.data;
  const bucket = data?.period.bucket ?? "MONTH";
  const model = toEvolutionSeries(data?.series ?? [], bucket, localeTag);
  const points = data?.series ?? [];
  // Phones open on the last point (there is no hover); wide screens wait for the pointer.
  const selected =
    vm.selectedPoint ?? (compact ? Math.max(points.length - 1, 0) : undefined);
  const point = selected === undefined ? undefined : points[selected];
  const first = points[0];
  const last = points[points.length - 1];
  const lastEmpty =
    model.firstFilled !== undefined && model.firstFilled > 0
      ? points[model.firstFilled - 1]
      : undefined;

  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }

  function describe() {
    if (!first || !last || last.marketValue === null) {
      return t("investment.overview.evolution.title");
    }

    return t("investment.overview.a11y.evolutionChart", {
      from: formatDay(first.date, localeTag),
      invested: money(last.invested ?? 0),
      market: money(last.marketValue ?? 0),
      to: formatDay(last.date, localeTag),
    });
  }

  return (
    <ChartCard
      emptyText={t("investment.overview.empty")}
      errorText={t("investment.overview.error")}
      legend={[
        { label: t("investment.overview.evolution.market"), tone: "accent" },
        {
          dashed: true,
          label: t("investment.overview.evolution.invested"),
          tone: "neutral",
        },
      ]}
      onRetry={vm.onRetry}
      retryLabel={t("investment.overview.retry")}
      state={vm.isEmpty ? "empty" : blockState(vm.dashboard)}
      subtitle={t("investment.overview.evolution.subtitle", {
        unit: t(
          `investment.overview.evolution.units.${bucket.toLowerCase() as "day" | "month" | "week"}`,
        ),
      })}
      testID={overviewTestIds.evolutionChart}
      title={t("investment.overview.evolution.title")}
    >
      <LineChart
        accessibilityLabel={describe()}
        formatTick={(value) => formatTick(value, localeTag, "BRL", compact)}
        formatValue={money}
        onSelect={vm.onPointSelect}
        selectedIndex={selected}
        series={[
          {
            area: true,
            emphasis: "primary",
            points: model.market,
            tone: "accent",
          },
          {
            dashed: true,
            emphasis: "muted",
            points: model.invested,
            tone: "neutral",
          },
        ]}
        testID="investment.overview.evolution-line"
      />
      {lastEmpty ? (
        <Text.Caption
          tone="secondary"
          value={t("investment.overview.evolution.noPositionUntil", {
            date: formatDay(lastEmpty.date, localeTag),
          })}
        />
      ) : null}
      {data?.summary.historyStartsAt ? (
        <Text.Caption
          tone="secondary"
          value={t("investment.overview.evolution.beforePrices", {
            date: formatDay(data.summary.historyStartsAt, localeTag),
          })}
        />
      ) : null}
      {point && point.marketValue !== null && point.invested !== null ? (
        <View style={styles.detail} testID={overviewTestIds.evolutionDetail}>
          <Text.BodyStrong value={formatDay(point.date, localeTag)} />
          <View style={styles.detailRow}>
            <Text.Caption
              tone="secondary"
              value={t("investment.overview.evolution.market")}
            />
            <Text.BodyStrong value={money(point.marketValue)} />
          </View>
          <View style={styles.detailRow}>
            <Text.Caption
              tone="secondary"
              value={t("investment.overview.evolution.invested")}
            />
            <Text.BodyStrong value={money(point.invested)} />
          </View>
          <View style={styles.detailRow}>
            <Text.Caption
              tone="secondary"
              value={t("investment.overview.evolution.openResult")}
            />
            <Text.BodyStrong
              tone={resultTone(point.marketValue - point.invested)}
              value={formatResult(
                point.marketValue - point.invested,
                "BRL",
                localeTag,
              )}
            />
          </View>
        </View>
      ) : (
        <Text.Caption
          tone="secondary"
          value={t("investment.overview.evolution.hint")}
        />
      )}
    </ChartCard>
  );
}

export default EvolutionBlock;
