import { View } from "react-native";

import {
  Badge,
  Button,
  ChartCard,
  LineChart,
  SegmentedControl,
  StatusBanner,
  Text,
} from "@components";
import { InvestmentPriceRange } from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import {
  formatMoney,
  formatPercent,
  formatResult,
  formatTime,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";
import { todayChange } from "@screens/Investment/models/quoteInfo";
import investmentTestIds from "@screens/Investment/testIds";

import { InvestmentDetailVM } from "../hooks";
import {
  axisLabel,
  buildChartPoints,
  hasOperationPoints,
} from "../models/priceChart";
import useStyles from "../styles";

const ids = investmentTestIds.detail;

const RANGES: [InvestmentPriceRange, string][] = [
  [InvestmentPriceRange.ONE_MONTH, "investment.history.oneMonth"],
  [InvestmentPriceRange.SIX_MONTHS, "investment.history.sixMonths"],
  [InvestmentPriceRange.ONE_YEAR, "investment.history.oneYear"],
  [InvestmentPriceRange.ALL, "investment.history.allRange"],
];

// Evolution of the price (or of the position in BRL for a USD asset); dashed where it is a line between operations.
function ChartPanel({
  asset,
  vm,
}: {
  asset: InvestmentAssetDetail;
  vm: InvestmentDetailVM;
}) {
  const { styles } = useStyles(false);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const usd = asset.currency === "USD";
  const position = usd && vm.chartMode === "position";
  const points = buildChartPoints(
    vm.history,
    vm.chartMode,
    asset.operations,
    (day) => axisLabel(day, localeTag),
  );
  const currency = position ? "BRL" : asset.currency;
  const startsAt = vm.history?.historyStartsAt;

  return (
    <ChartCard
      actions={
        <View style={styles.chartControls}>
          <SegmentedControl
            accessibilityLabel={t("investment.history.title")}
            onChange={(value) =>
              vm.onRangeChange(value as InvestmentPriceRange)
            }
            options={RANGES.map(([value, key]) => ({
              label: t(key as never),
              value,
            }))}
            testID={ids.rangeTabs}
            value={vm.range}
          />
          {usd ? (
            <SegmentedControl
              accessibilityLabel={t("investment.history.title")}
              onChange={(value) =>
                vm.onChartModeChange(value as "position" | "price")
              }
              options={[
                { label: t("investment.history.modePrice"), value: "price" },
                {
                  label: t("investment.history.modePosition"),
                  value: "position",
                },
              ]}
              testID={ids.chartMode}
              value={vm.chartMode}
            />
          ) : null}
        </View>
      }
      emptyText={t("investment.history.empty")}
      errorText={t("investment.errors.generic")}
      footnote={
        startsAt
          ? t("investment.history.startsAt", {
              date: axisLabel(startsAt, localeTag),
            })
          : undefined
      }
      legend={[
        ...(hasOperationPoints(vm.history)
          ? [
              {
                dashed: true,
                label: t("investment.history.dashedLegend", {
                  date: startsAt ? axisLabel(startsAt, localeTag) : "—",
                }),
                tone: "accent" as const,
              },
            ]
          : []),
        { label: t("investment.history.closeLegend"), tone: "accent" },
      ]}
      onRetry={vm.onRetry}
      retryLabel={t("common.actions.tryAgain")}
      state={chartState(vm, points.length)}
      testID={ids.chart}
      title={t("investment.history.title")}
    >
      <LineChart
        accessibilityLabel={t("investment.history.title")}
        formatTick={(value) =>
          position
            ? formatMoney(Math.round(value * 100), "BRL", localeTag)
            : formatUnitPrice(String(value), currency, localeTag, 2)
        }
        formatValue={(value) =>
          position
            ? formatMoney(Math.round(value * 100), "BRL", localeTag)
            : formatUnitPrice(String(value), currency, localeTag, 2)
        }
        height={260}
        points={points}
      />
    </ChartCard>
  );
}

function chartState(
  vm: InvestmentDetailVM,
  count: number,
): "empty" | "error" | "loading" | "ready" {
  if (vm.historyLoading) {
    return "loading";
  }

  return count < 2 ? "empty" : "ready";
}

// The price line of the detail (spec 104 artboard): price, day move, when and from where it came, the rate.
function PriceBlock({
  asset,
  vm,
}: {
  asset: InvestmentAssetDetail;
  vm: InvestmentDetailVM;
}) {
  const { styles } = useStyles(false);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { position, quote } = asset;

  if (!position.currentUnitPrice) {
    return null;
  }

  const change = todayChange(asset);
  const price = formatUnitPrice(
    position.currentUnitPrice,
    asset.currency,
    localeTag,
  );
  const dayMove =
    quote?.previousClose && change !== null
      ? `${formatResult(
          Math.round(
            (Number(position.currentUnitPrice) - Number(quote.previousClose)) *
              100,
          ),
          asset.currency,
          localeTag,
        )} (${formatPercent(change, localeTag)}) ${t("investment.quote.dayChange", { change: "" }).trim()}`
      : undefined;

  return (
    <View style={styles.priceBlock} testID={ids.priceBlock}>
      <Text.Display tabular testID={ids.price} value={price} />
      {dayMove ? (
        <Text.BodyStrong tabular tone={resultTone(change)} value={dayMove} />
      ) : null}
      {quote ? (
        <Text.Caption
          tone={quote.stale ? "warning" : "secondary"}
          value={[
            t("investment.quote.updatedAt", {
              time: formatTime(quote.quotedAt, localeTag),
            }),
            quote.source,
            t("investment.quote.everyHour"),
            asset.fx
              ? `US$ 1 = ${formatUnitPrice(asset.fx.rate, "BRL", localeTag, 4)}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      ) : null}
      {quote?.unavailable ? (
        <Badge label={t("investment.quote.unavailable")} />
      ) : null}
      {vm.quotesSourceDown ? (
        <StatusBanner
          message={t("investment.quote.sourceDown")}
          testID={ids.sourceDownBanner}
        />
      ) : null}
    </View>
  );
}

// "Today's quote": last price, previous close, day range, dollar, source, the BRL split and the manual value actions.
function QuotePanel({
  asset,
  vm,
}: {
  asset: InvestmentAssetDetail;
  vm: InvestmentDetailVM;
}) {
  const { styles } = useStyles(false);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { quote } = asset;

  if (!quote) {
    return null;
  }

  function unit(value: string) {
    return formatUnitPrice(value, asset.currency, localeTag);
  }
  const rows: [string, string][] = [
    [t("investment.quote.lastPrice"), unit(quote.price)],
    ...(quote.previousClose
      ? ([[t("investment.quote.previousClose"), unit(quote.previousClose)]] as [
          string,
          string,
        ][])
      : []),
    ...(quote.dayHigh && quote.dayLow
      ? ([
          [
            t("investment.quote.dayRange"),
            `${unit(quote.dayHigh)} / ${unit(quote.dayLow)}`,
          ],
        ] as [string, string][])
      : []),
    ...(asset.fx
      ? ([
          [
            t("investment.quote.dollar"),
            formatUnitPrice(asset.fx.rate, "BRL", localeTag, 4),
          ],
        ] as [string, string][])
      : []),
    [
      t("investment.quote.source"),
      t("investment.quote.sourceLine", {
        source: quote.source,
        time: formatTime(quote.quotedAt, localeTag),
      }),
    ],
  ];

  return (
    <View style={styles.quotePanel} testID={ids.quotePanel}>
      <Text.Heading value={t("investment.quote.today")} />
      {rows.map(([label, value]) => (
        <View key={label} style={styles.quoteRow}>
          <Text.Caption tone="secondary" value={label} />
          <Text.Body tabular value={value} />
        </View>
      ))}
      {asset.brl ? (
        <Text.Caption
          testID={ids.brlSplit}
          tone="secondary"
          value={t("investment.result.split", {
            asset: formatResult(asset.brl.resultFromAsset, "BRL", localeTag),
            fx: formatResult(asset.brl.resultFromFx, "BRL", localeTag),
          })}
        />
      ) : null}
      {quote.unavailable ? (
        <Text.Caption
          tone="warning"
          value={t("investment.quote.unavailableBody", {
            ticker: asset.ticker ?? asset.name,
          })}
        />
      ) : null}
      {vm.readOnly || vm.archived ? null : (
        <View style={styles.quoteActions}>
          <Button.Ghost
            inline
            label={t("investment.quote.enterManual")}
            onPress={vm.onUpdateValue}
            testID={ids.enterManual}
          />
          {vm.manualOverQuote ? (
            <Button.Ghost
              inline
              label={t("investment.quote.backToAuto")}
              onPress={vm.onBackToAutomatic}
              testID={ids.backToAuto}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

function RefreshButton({ vm }: { vm: InvestmentDetailVM }) {
  const { t } = useTranslation();

  return (
    <View style={{ gap: 4 }}>
      <Button.Secondary
        disabled={vm.quotesDisabled}
        icon="refresh"
        label={
          vm.quotesRefreshing
            ? t("investment.quote.refreshing")
            : t("investment.quote.refreshNow")
        }
        loading={vm.quotesRefreshing}
        onPress={vm.onQuotesRefresh}
        testID={ids.refreshQuotes}
      />
      {vm.quotesSecondsLeft > 0 ? (
        <Text.Caption
          accessibilityLiveRegion="polite"
          testID={ids.refreshCountdown}
          tone="secondary"
          value={t("investment.quote.availableIn", {
            seconds: vm.quotesSecondsLeft,
          })}
        />
      ) : null}
    </View>
  );
}

export { ChartPanel, PriceBlock, QuotePanel, RefreshButton };
