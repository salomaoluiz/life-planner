import { View } from "react-native";

import { ChartCard, ColumnChart, Text, useDensity } from "@components";
import { InvestmentIncomeType } from "@domain/entities/investment/enums";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import blockState from "@screens/Financial/Overview/models/blockState";
import {
  formatDay,
  formatTick,
} from "@screens/Financial/Overview/models/overviewFormat";
import { formatMoney } from "@screens/Investment/models/format";

import { InvestmentOverviewVM } from "../hooks";
import {
  averageReceived,
  incomeUnit,
  toIncomeGroups,
} from "../models/incomeModel";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Spec 110 FR 21-22: income per bucket, received (solid) and planned (dashed), with the average of what was received
// and, for the chosen bucket, its totals and how many incomes of each type.
function IncomeBlock(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const data = vm.dashboard.data;
  const incomes = data?.incomes ?? [];
  const bucket = data?.period.bucket ?? "MONTH";
  const average = averageReceived(incomes);
  const chosen =
    vm.selectedIncome === undefined ? undefined : incomes[vm.selectedIncome];
  const received = t("investment.overview.income.received");

  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }

  return (
    <ChartCard
      emptyText={t("investment.overview.empty")}
      errorText={t("investment.overview.error")}
      legend={[
        {
          label:
            average === undefined
              ? received
              : `${received} · ${t("investment.overview.income.average", {
                  amount: money(average),
                  unit: t(
                    `investment.overview.income.units.${incomeUnit(bucket)}`,
                  ),
                })}`,
          tone: "income",
        },
        {
          dashed: true,
          label: t("investment.overview.income.planned"),
          tone: "neutral",
        },
      ]}
      onRetry={vm.onRetry}
      retryLabel={t("investment.overview.retry")}
      state={vm.isEmpty ? "empty" : blockState(vm.dashboard)}
      subtitle={t("investment.overview.income.subtitle")}
      testID={overviewTestIds.incomeChart}
      title={t("investment.overview.income.title")}
    >
      <ColumnChart
        accessibilityLabel={t("investment.overview.a11y.incomeChart", {
          from: formatDay(data?.period.from ?? vm.period.from, localeTag),
          to: formatDay(data?.period.to ?? vm.period.to, localeTag),
          total: money(data?.summary.incomeReceived ?? 0),
        })}
        formatTick={(value) => formatTick(value, localeTag, "BRL", compact)}
        formatValue={money}
        groups={toIncomeGroups(incomes, bucket, localeTag)}
        incomeOnly
        onSelect={vm.onIncomeSelect}
        selectedIndex={vm.selectedIncome}
        testID="investment.overview.income-columns"
      />
      {chosen ? (
        <View style={styles.detail} testID={overviewTestIds.incomeDetail}>
          <Text.BodyStrong value={formatDay(chosen.date, localeTag)} />
          <Text.Caption
            tone="secondary"
            value={`${received} ${money(chosen.received)} · ${t("investment.overview.income.planned")} ${money(chosen.planned)}`}
          />
          <Text.Caption
            tone="secondary"
            value={Object.values(InvestmentIncomeType)
              .filter((type) => chosen.byType[type] > 0)
              .map(
                (type) =>
                  `${t(`investment.income.types.${type}`)}: ${chosen.byType[type]}`,
              )
              .join(" · ")}
          />
        </View>
      ) : null}
    </ChartCard>
  );
}

export default IncomeBlock;
