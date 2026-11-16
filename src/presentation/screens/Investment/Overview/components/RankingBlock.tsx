import { View } from "react-native";

import {
  Button,
  ChartCard,
  ColorDot,
  ListItem,
  RemovableChip,
  Text,
} from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";
import { investmentClassPalette } from "@presentation/theme/constants/investmentClassPalette";
import blockState from "@screens/Financial/Overview/models/blockState";
import {
  formatMoney,
  formatPercent,
  formatResult,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";

import { InvestmentOverviewVM } from "../hooks";
import { captionKey, rankingView } from "../models/rankingModel";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Spec 110 FR 19-20: the open positions by value, filtered by the class tapped in the allocation, 10 rows until
// "See all". A row opens the asset detail.
function RankingBlock(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { isDark } = useTheme();
  const palette = investmentClassPalette[isDark ? "dark" : "light"];
  const ranking = vm.dashboard.data?.ranking ?? [];
  const view = rankingView(ranking, vm.selectedClass, vm.expanded);
  const hasUsd = ranking.some((row) => row.usdValue !== undefined);

  function share(fraction: number) {
    return new Intl.NumberFormat(localeTag, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
      style: "percent",
    }).format(fraction);
  }

  function secondLine(row: (typeof ranking)[number]) {
    const key = captionKey(row);

    return [
      share(row.share),
      row.usdValue
        ? t("investment.overview.ranking.usdValue", {
            value: formatUnitPrice(row.usdValue, "USD", localeTag, 2).replace(
              /^US\$\s?/,
              "",
            ),
          })
        : undefined,
      key ? t(key) : undefined,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return (
    <ChartCard
      actions={
        vm.selectedClass ? (
          <RemovableChip
            dotColor={palette[vm.selectedClass]}
            label={t(`investment.classGroup.${vm.selectedClass}`)}
            onRemove={vm.onClassClear}
            removeLabel={t("investment.overview.ranking.clearFilter")}
            removeTestID={overviewTestIds.rankingFilterClear}
            testID="investment.overview.ranking-filter"
          />
        ) : undefined
      }
      emptyText={t("investment.overview.empty")}
      errorText={t("investment.overview.error")}
      footnote={hasUsd ? t("investment.overview.ranking.footnote") : undefined}
      onRetry={vm.onRetry}
      retryLabel={t("investment.overview.retry")}
      state={vm.isEmpty ? "empty" : blockState(vm.dashboard)}
      subtitle={t("investment.overview.ranking.subtitle")}
      title={t("investment.overview.ranking.title")}
    >
      {view.rows.map((row) => (
        <ListItem
          divider
          key={row.assetId}
          leading={<ColorDot color={palette[row.assetClass]} />}
          onPress={() => vm.onAssetPress(row.assetId)}
          subtitle={`${row.ticker ? row.name : ""}${row.ticker && secondLine(row) ? " · " : ""}${secondLine(row)}`}
          testID={overviewTestIds.rankingRow(row.assetId)}
          title={row.ticker ?? row.name}
          trailing={
            <View style={styles.rankingTrailing}>
              <Text.BodyStrong
                value={formatMoney(row.value, "BRL", localeTag)}
              />
              <Text.Caption
                tone={resultTone(row.openResult)}
                value={`${formatResult(row.openResult, "BRL", localeTag)}${row.openResultPercent === null ? "" : ` ${formatPercent(row.openResultPercent, localeTag)}`}`}
              />
            </View>
          }
        />
      ))}
      {view.canExpand ? (
        <Button.Secondary
          label={t("investment.overview.ranking.seeAll", { count: view.total })}
          onPress={vm.onSeeAll}
          testID={overviewTestIds.rankingSeeAll}
        />
      ) : null}
    </ChartCard>
  );
}

export default RankingBlock;
