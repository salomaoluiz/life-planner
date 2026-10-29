import { View } from "react-native";

import { ChartCard, ColumnChart, Text } from "@components";
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
import { todayIndex } from "../models/overviewPeriod";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Income × expenses per month (week for periods up to 92 days), spec 046 FR 13.
function IncomeExpenseBlock(props: {
  compact: boolean;
  vm: OverviewViewModel;
}) {
  const { compact, vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const currency = vm.currency as CurrencyCode;
  const data = vm.periodTotals.data;
  const items = data?.groupBy === "PERIOD" ? data.items : [];
  const bucket = data?.groupBy === "PERIOD" ? data.bucket : "MONTH";
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  function sum(amounts: { projected: number; realized: number }) {
    return amounts.projected + amounts.realized;
  }
  const marker = todayIndex(items, vm.today);
  const picked =
    vm.selectedGroup === undefined ? undefined : items[vm.selectedGroup];

  return (
    <ChartCard
      errorText={t("financial.overview.blockError")}
      legend={[
        { label: t("financial.overview.tiles.income"), tone: "income" },
        { label: t("financial.overview.tiles.expense"), tone: "expense" },
      ]}
      onRetry={vm.periodTotals.refetch}
      retryLabel={t("financial.overview.retry")}
      state={blockState(vm.periodTotals)}
      testID={overviewTestIds.incomeExpenseChart}
      title={t("financial.overview.incomeExpense.title")}
    >
      <ColumnChart
        accessibilityLabel={t("financial.overview.a11y.incomeExpenseChart", {
          from: formatDay(vm.period.from, localeTag),
          to: formatDay(vm.period.to, localeTag),
        })}
        formatTick={(value) => formatTick(value, localeTag, currency, compact)}
        formatValue={money}
        groups={items.map((item) => ({
          expense: item.expense,
          income: item.income,
          label: formatBucketLabel(
            item.start,
            bucket === "WEEK" ? "WEEK" : "MONTH",
            localeTag,
          ),
        }))}
        onSelect={vm.setSelectedGroup}
        selectedIndex={vm.selectedGroup}
        testID="financial.overview.income-expense-columns"
        today={
          marker === undefined
            ? undefined
            : { index: marker, label: t("financial.overview.today") }
        }
      />
      {picked ? (
        <View
          style={styles.detail}
          testID={overviewTestIds.incomeExpenseDetail}
        >
          <Text.Caption
            tone="secondary"
            value={t("financial.overview.incomeExpense.detail", {
              expense: money(sum(picked.expense)),
              income: money(sum(picked.income)),
              label: formatDay(picked.start, localeTag),
              result: money(sum(picked.income) - sum(picked.expense)),
            })}
          />
        </View>
      ) : null}
    </ChartCard>
  );
}

export default IncomeExpenseBlock;
