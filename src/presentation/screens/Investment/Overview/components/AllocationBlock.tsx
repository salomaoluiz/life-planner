import { View } from "react-native";

import {
  ChartCard,
  ColorDot,
  DonutChart,
  ListItem,
  Text,
  useDensity,
} from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";
import { investmentClassPalette } from "@presentation/theme/constants/investmentClassPalette";
import blockState from "@screens/Financial/Overview/models/blockState";
import {
  compactAmount,
  formatDay,
} from "@screens/Financial/Overview/models/overviewFormat";
import {
  formatMoney,
  formatResult,
  formatUnitPrice,
} from "@screens/Investment/models/format";

import { InvestmentOverviewVM } from "../hooks";
import toAllocationSlices from "../models/allocationModel";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Spec 110 FR 15-17: allocation by class at the end of the period. The legend rows are buttons that filter the
// ranking; the selected class also shows the dollar detail of its foreign assets.
function AllocationBlock(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { isDark } = useTheme();
  const compact = useDensity().density === "compact";
  const data = vm.dashboard.data;
  const palette = investmentClassPalette[isDark ? "dark" : "light"];
  const slices = toAllocationSlices(
    data?.allocation ?? [],
    (assetClass) =>
      assetClass === "FIXED_INCOME"
        ? t("investment.overview.allocation.fixedIncome")
        : t(`investment.classGroup.${assetClass}`),
    palette,
  );
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const selected = slices.find((slice) => slice.id === vm.selectedClass);

  function percent(share: number) {
    return new Intl.NumberFormat(localeTag, {
      maximumFractionDigits: 0,
      style: "percent",
    }).format(share);
  }

  return (
    <ChartCard
      emptyText={t("investment.overview.empty")}
      errorText={t("investment.overview.error")}
      onRetry={vm.onRetry}
      retryLabel={t("investment.overview.retry")}
      state={vm.isEmpty ? "empty" : blockState(vm.dashboard)}
      subtitle={t("investment.overview.allocation.subtitle")}
      testID={overviewTestIds.allocationChart}
      title={t("investment.overview.allocation.title")}
    >
      <View style={styles.allocation}>
        <DonutChart
          accessibilityLabel={t("investment.overview.a11y.allocationChart", {
            items: slices
              .map((slice) => `${slice.label} ${percent(slice.share)}`)
              .join(", "),
            total: formatMoney(total, "BRL", localeTag),
          })}
          centerLabel={
            selected
              ? selected.label
              : t("investment.overview.allocation.total")
          }
          centerValue={
            selected
              ? percent(selected.share)
              : compactAmount(total, localeTag, "BRL")
          }
          onSelect={(id) =>
            vm.onClassSelect(id as string & typeof vm.selectedClass)
          }
          selectedId={vm.selectedClass}
          size={compact ? 132 : 168}
          slices={slices.map((slice) => ({
            id: slice.id,
            label: slice.label,
            swatch: slice.swatch,
            value: slice.value,
          }))}
          testID="investment.overview.donut"
        />
        <View style={styles.legend}>
          {slices.map((slice) => (
            <ListItem
              inset
              key={slice.id}
              leading={<ColorDot color={slice.swatch} />}
              onPress={() => vm.onClassSelect(slice.id)}
              selected={slice.id === vm.selectedClass}
              subtitle={percent(slice.share)}
              testID={overviewTestIds.allocationClass(slice.id)}
              title={slice.label}
              trailing={
                <Text.BodyStrong
                  value={formatMoney(slice.value, "BRL", localeTag)}
                />
              }
            />
          ))}
        </View>
      </View>
      {selected?.usd ? (
        <View style={styles.detail} testID={overviewTestIds.usdDetail}>
          <Text.BodyStrong
            value={`${selected.label} ${formatMoney(selected.value, "BRL", localeTag)}`}
          />
          <Text.Caption
            tone="secondary"
            value={`${t("investment.overview.allocation.inUsd")} ${formatUnitPrice(selected.usd.value, "USD", localeTag, 2)}`}
          />
          <Text.Caption
            tone="secondary"
            value={`${t("investment.overview.allocation.fxRate", { date: formatDay(vm.period.to, localeTag) })} ${formatUnitPrice(selected.usd.fxRate, "BRL", localeTag, 4)}`}
          />
          <Text.Caption
            tone="secondary"
            value={`${t("investment.overview.allocation.fromAsset")} ${formatResult(selected.usd.resultFromAsset, "BRL", localeTag)}`}
          />
          <Text.Caption
            tone="secondary"
            value={`${t("investment.overview.allocation.fromDollar")} ${formatResult(selected.usd.resultFromFx, "BRL", localeTag)}`}
          />
        </View>
      ) : null}
    </ChartCard>
  );
}

export default AllocationBlock;
