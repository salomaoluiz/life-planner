import { View } from "react-native";

import {
  AdaptiveViewProps,
  Card,
  ChartCard,
  ColorMark,
  ColumnChart,
  DonutChart,
  EmptyState,
  ErrorState,
  LineChart,
  Screen,
  ScreenHeader,
  ShareBar,
  StatTile,
  Text,
  Touchable,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import {
  formatDay,
  formatTick,
} from "@screens/Financial/Overview/models/overviewFormat";
import { INVESTMENT_MAX_WIDTH } from "@screens/Investment/constants";
import SectionTabs from "@screens/Investment/Layout/components/SectionTabs";
import useInvestmentSections from "@screens/Investment/Layout/hooks/useInvestmentSections";

import OverviewToolbar from "../components/OverviewToolbar";
import type { InvestmentOverviewVM } from "../hooks";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

function Allocation(props: { vm: InvestmentOverviewVM }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { vm } = props;
  const allocation = vm.allocation;

  if (!allocation) {
    return null;
  }

  return (
    <Card padding="md">
      <Text.Heading
        accessibilityRole="header"
        value={t("investment.overview.allocation.title")}
      />
      <Text.Caption
        tone="secondary"
        value={t("investment.overview.allocation.subtitle")}
      />
      <View style={styles.donutWrap}>
        <DonutChart
          accessibilityLabel={allocation.legend}
          centerLabel={allocation.centerLabel}
          centerValue={allocation.centerValue}
          slices={allocation.rows.map((row) => ({
            share: row.share,
            swatch: row.swatch,
            testID: overviewTestIds.allocationSlice(row.assetClass),
          }))}
          testID={overviewTestIds.allocation}
        />
      </View>
      <View style={styles.stack}>
        {allocation.rows.map((row) => (
          <Touchable
            accessibilityLabel={`${row.label}, ${row.valueText}, ${row.percent}`}
            accessibilityRole="button"
            key={row.assetClass}
            onPress={() => vm.onSelectClass(row.assetClass)}
            selected={row.pressed}
            testID={overviewTestIds.allocationClass(row.assetClass)}
          >
            <View style={styles.legendRow}>
              <ColorMark color={row.swatch} />
              <View style={{ flex: 1 }}>
                <Text.Body value={row.label} />
              </View>
              <Text.BodyStrong value={row.valueText} />
              <Text.Caption tone="secondary" value={row.percent} />
            </View>
          </Touchable>
        ))}
      </View>
    </Card>
  );
}

function Evolution(props: { vm: InvestmentOverviewVM }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { vm } = props;
  const market = vm.series.map((point, index) => ({
    accessibilityLabel: formatDay(point.date, localeTag),
    label: vm.labels[index] ?? "",
    projected: false,
    value: point.marketValue,
  }));
  const invested = vm.series.map((point, index) => ({
    accessibilityLabel: formatDay(point.date, localeTag),
    label: vm.labels[index] ?? "",
    projected: false,
    value: point.invested,
  }));
  const selected = vm.selectedPoint;
  const point = selected === undefined ? undefined : vm.series[selected];

  return (
    <ChartCard
      errorText={t("investment.overview.error")}
      legend={[
        {
          label: t("investment.overview.evolution.market"),
          tone: "accent",
        },
        {
          dashed: true,
          label: t("investment.overview.evolution.invested"),
          muted: true,
          tone: "neutral",
        },
      ]}
      onRetry={vm.onRetry}
      retryLabel={t("common.actions.tryAgain")}
      state="ready"
      subtitle={t("investment.overview.evolution.subtitle", {
        unit: vm.bucketUnit,
      })}
      testID={overviewTestIds.evolution}
      title={t("investment.overview.evolution.title")}
    >
      <View style={styles.pairs}>
        <View style={styles.growth}>
          <LineChart
            accessibilityLabel={t("investment.overview.evolution.title")}
            formatTick={(value) => formatTick(value, localeTag, "BRL", false)}
            formatValue={(value) => formatAmount(value, localeTag, "BRL")}
            onSelect={vm.onSelectPoint}
            selectedIndex={vm.selectedPoint}
            series={[
              { emphasis: "primary", points: market },
              {
                dashed: true,
                emphasis: "muted",
                points: invested,
                tone: "secondary",
              },
            ]}
            testID={overviewTestIds.evolutionChart}
          />
        </View>
        {point ? (
          <View style={styles.detail} testID={overviewTestIds.evolutionDetail}>
            <Text.BodyStrong value={formatDay(point.date, localeTag)} />
            <View style={styles.detailRow}>
              <Text.Caption
                tone="secondary"
                value={t("investment.overview.evolution.market")}
              />
              <Text.Caption
                value={formatAmount(point.marketValue ?? 0, localeTag, "BRL")}
              />
            </View>
            <View style={styles.detailRow}>
              <Text.Caption
                tone="secondary"
                value={t("investment.overview.evolution.invested")}
              />
              <Text.Caption
                value={formatAmount(point.invested ?? 0, localeTag, "BRL")}
              />
            </View>
          </View>
        ) : null}
      </View>
    </ChartCard>
  );
}

function Income(props: { vm: InvestmentOverviewVM }) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { vm } = props;

  return (
    <ChartCard
      errorText={t("investment.overview.error")}
      legend={[
        {
          label: t("investment.overview.income.received"),
          tone: "income",
        },
        {
          dashed: true,
          label: t("investment.overview.income.planned"),
          tone: "income",
        },
      ]}
      onRetry={vm.onRetry}
      retryLabel={t("common.actions.tryAgain")}
      state="ready"
      subtitle={t("investment.overview.income.subtitle")}
      testID={overviewTestIds.income}
      title={t("investment.overview.income.title")}
    >
      <ColumnChart
        accessibilityLabel={t("investment.overview.income.title")}
        formatTick={(value) => formatTick(value, localeTag, "BRL", false)}
        formatValue={(value) => formatAmount(value, localeTag, "BRL")}
        groups={vm.income.map((bucket) => ({
          expense: { projected: 0, realized: 0 },
          income: { projected: bucket.planned, realized: bucket.received },
          label: bucket.label,
        }))}
        projectedStyle="dashed"
        testID={overviewTestIds.incomeChart}
      />
    </ChartCard>
  );
}

function Ranking(props: { vm: InvestmentOverviewVM }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { vm } = props;
  const ranking = vm.ranking;

  if (!ranking) {
    return null;
  }

  return (
    <Card padding="md">
      <Text.Heading
        accessibilityRole="header"
        value={t("investment.overview.ranking.title")}
      />
      <Text.Caption
        tone="secondary"
        value={t("investment.overview.ranking.subtitle")}
      />
      {vm.rankingFilterLabel ? (
        <Touchable
          accessibilityLabel={t("investment.overview.ranking.clear")}
          accessibilityRole="button"
          onPress={vm.onClearFilter}
          testID={overviewTestIds.rankingFilterClear}
        >
          <Text.Caption tone="accent" value={`${vm.rankingFilterLabel} ✕`} />
        </Touchable>
      ) : null}
      {ranking.rows.length === 0 ? (
        <Text.Caption
          tone="secondary"
          value={t("investment.overview.ranking.emptyFiltered")}
        />
      ) : (
        <View style={styles.stack}>
          {ranking.rows.map((row) => (
            <RankingRow key={row.assetId} onPress={vm.onOpenAsset} row={row} />
          ))}
        </View>
      )}
      {vm.totalRanking > ranking.rows.length ? (
        <Touchable
          accessibilityLabel={t("investment.overview.ranking.seeAll", {
            count: vm.totalRanking,
          })}
          accessibilityRole="button"
          onPress={vm.onSeeAll}
          testID={overviewTestIds.rankingSeeAll}
        >
          <Text.Caption
            tone="accent"
            value={t("investment.overview.ranking.seeAll", {
              count: vm.totalRanking,
            })}
          />
        </Touchable>
      ) : null}
      <Text.Caption
        tone="secondary"
        value={t("investment.overview.ranking.usdNote")}
      />
    </Card>
  );
}

function RankingRow(props: {
  onPress: (assetId: string) => void;
  row: InvestmentOverviewVM["ranking"] extends undefined
    ? never
    : NonNullable<InvestmentOverviewVM["ranking"]>["rows"][number];
}) {
  const { styles } = useStyles();
  const { row } = props;

  return (
    <Touchable
      accessibilityLabel={`${row.ticker}, ${row.valueText}, ${row.resultPercent}`}
      accessibilityRole="button"
      onPress={() => props.onPress(row.assetId)}
      style={styles.rankRow}
      testID={overviewTestIds.rankingRow(row.assetId)}
    >
      <ColorMark color={row.swatch} height={32} shape="bar" />
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text.BodyStrong value={row.ticker} />
          <Text.Caption numberOfLines={1} tone="secondary" value={row.name} />
        </View>
        <ShareBar
          accessibilityLabel={`${row.ticker}, ${row.valueText}`}
          color={row.swatch}
          progress={row.barShare}
        />
        <Text.Caption tone="secondary" value={row.subline} />
      </View>
      <View style={styles.rankValues}>
        <Text.BodyStrong value={row.valueText} />
        <Text.Caption
          tone={row.tone === "expense" ? "expense" : "income"}
          value={`${row.resultText}${row.resultPercent ? ` (${row.resultPercent})` : ""}`}
        />
      </View>
    </Touchable>
  );
}

function Tiles(props: { vm: InvestmentOverviewVM }) {
  const { styles } = useStyles();
  const { vm } = props;

  return (
    <View style={styles.tiles} testID="investment.overview.tiles">
      {vm.tiles.map((tile) => (
        <View key={tile.testID} style={styles.tileFive}>
          <StatTile
            label={tile.label}
            testID={tile.testID}
            value={tile.value}
          />
        </View>
      ))}
    </View>
  );
}

function Toolbar(props: { vm: InvestmentOverviewVM }) {
  return <OverviewToolbar vm={props.vm} />;
}

// The investments overview: tiles, evolution, allocation, ranking and income (spec 110).
function Wide({ vm }: AdaptiveViewProps<InvestmentOverviewVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const sections = useInvestmentSections();

  if (vm.status === "pending") {
    return (
      <Screen maxWidth={INVESTMENT_MAX_WIDTH} testID={overviewTestIds.screen}>
        <ScreenHeader title={t("investment.title")} />
        <SectionTabs
          accessibilityLabel={t("investment.title")}
          active={sections.section}
          onSelect={sections.onSelect}
          tabs={sections.tabs}
          testID="investment.sections"
        />
        <View style={styles.blocks} testID={overviewTestIds.skeleton}>
          <Skeleton.Box height={120} width="100%" />
          <Skeleton.Box height={220} width="100%" />
        </View>
      </Screen>
    );
  }

  if (vm.status === "error") {
    return (
      <Screen maxWidth={INVESTMENT_MAX_WIDTH} testID={overviewTestIds.screen}>
        <ScreenHeader title={t("investment.title")} />
        <SectionTabs
          accessibilityLabel={t("investment.title")}
          active={sections.section}
          onSelect={sections.onSelect}
          tabs={sections.tabs}
          testID="investment.sections"
        />
        <ErrorState
          message={t("investment.overview.error")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={overviewTestIds.errorRetry}
        />
      </Screen>
    );
  }

  return (
    <Screen
      maxWidth={INVESTMENT_MAX_WIDTH}
      scroll
      testID={overviewTestIds.screen}
    >
      <ScreenHeader
        actions={
          vm.hasPositions ? (
            <Text.Caption
              tone="secondary"
              value={t("investment.overview.period.range", {
                from: formatDay(vm.period.from, localeTag),
                to: formatDay(vm.period.to, localeTag),
              })}
            />
          ) : null
        }
        title={t("investment.title")}
      />
      <SectionTabs
        accessibilityLabel={t("investment.title")}
        active={sections.section}
        onSelect={sections.onSelect}
        tabs={sections.tabs}
        testID="investment.sections"
      />
      <View style={styles.blocks}>
        <Toolbar vm={vm} />

        {!vm.hasPositions ? (
          <Card padding="lg">
            <EmptyState
              actionLabel={t("investment.overview.newAsset")}
              icon="chart-line"
              message={t("investment.overview.emptyBody")}
              onAction={vm.onAddAsset}
              testID={overviewTestIds.empty}
              title={vm.emptyMessage}
            />
          </Card>
        ) : (
          <>
            {vm.showStale ? (
              <Card padding="sm" variant="dashed">
                <Text.Caption
                  testID={overviewTestIds.stale}
                  tone="warning"
                  value={vm.staleMessage}
                />
              </Card>
            ) : null}
            <Tiles vm={vm} />
            {vm.showNoValue ? (
              <Text.Caption
                testID={overviewTestIds.noValue}
                tone="secondary"
                value={vm.noValue}
              />
            ) : null}
            <Evolution vm={vm} />
            <View style={styles.pairs}>
              <View style={styles.pair}>
                <Allocation vm={vm} />
              </View>
              <View style={[styles.pair, styles.growth]}>
                <Ranking vm={vm} />
              </View>
            </View>
            <Income vm={vm} />
          </>
        )}
      </View>
      {vm.historyStartsAt ? (
        <Text.Caption
          tone="secondary"
          value={t("investment.overview.historyStartsAt", {
            date: formatDay(vm.historyStartsAt, localeTag),
          })}
        />
      ) : null}
    </Screen>
  );
}

export default Wide;
