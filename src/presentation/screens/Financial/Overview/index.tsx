import { useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";

import { EmptyState, StatTile } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useBreakpoint, useTheme } from "@presentation/theme";
import { FiltersModal } from "@screens/Financial/Transactions/modals";

import BalanceBlock from "./components/BalanceBlock";
import CategoriesBlock from "./components/CategoriesBlock";
import CustomPeriodSheet from "./components/CustomPeriodSheet";
import IncomeExpenseBlock from "./components/IncomeExpenseBlock";
import OverviewToolbar from "./components/OverviewToolbar";
import TagsBlock from "./components/TagsBlock";
import { useOverviewViewModel } from "./hooks";
import {
  compactAmount,
  deltaOf,
  formatDay,
  tileColumns,
} from "./models/overviewFormat";
import useStyles from "./styles";
import overviewTestIds from "./testIds";

function FinancialOverview() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const breakpoint = useBreakpoint();
  const compact = breakpoint === "compact";
  const { theme } = useTheme();
  const [tilesWidth, setTilesWidth] = useState(0);
  const columns = tileColumns(tilesWidth, theme.sizes.spacing.sm);
  const vm = useOverviewViewModel();
  const currency = vm.currency as CurrencyCode;
  const summary = vm.summary.data;
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  // Spec 053 FR 16: the deltas always include the projected amounts, and say so when there are any.
  const hasProjected =
    !!summary && summary.income.projected + summary.expense.projected > 0;
  const baseNote = t("financial.overview.tiles.vsPrevious");
  const projectedNote = t(
    hasProjected
      ? "financial.overview.delta.inclProjected"
      : "financial.overview.tiles.vsPrevious",
  );
  const projectedEnd = summary?.balance.projectedEnd;
  const loading = !summary;
  const income = summary
    ? summary.income.realized + summary.income.projected
    : 0;
  const expense = summary
    ? summary.expense.realized + summary.expense.projected
    : 0;
  function tile(
    name: string,
    label: string,
    value: number,
    previous: number | undefined,
    direction: "upIsBad" | "upIsGood",
    extra?: { testID: string; text: string },
  ) {
    return (
      <View style={columns === 4 ? styles.tileFour : styles.tileTwo}>
        <StatTile
          compactValue={compactAmount(value, localeTag, currency)}
          delta={{
            ...deltaOf(value, previous, direction, localeTag),
            note: name === "balance" ? baseNote : projectedNote,
          }}
          extra={extra}
          label={label}
          loading={loading}
          testID={overviewTestIds.tile(name)}
          value={money(value)}
        />
      </View>
    );
  }

  if (
    vm.ownerFilter &&
    vm.allOwnerIds.length === 0 &&
    vm.summary.status === "pending"
  ) {
    return <View style={styles.root} testID={overviewTestIds.screen} />;
  }

  return (
    <View style={styles.root} testID={overviewTestIds.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.center}>
          <View style={styles.blocks}>
            <OverviewToolbar vm={vm} />
            <View
              onLayout={(event: LayoutChangeEvent) =>
                setTilesWidth(event.nativeEvent.layout.width)
              }
              style={styles.tiles}
            >
              {tile(
                "balance",
                t("financial.overview.tiles.balance"),
                summary?.balance.current ?? 0,
                summary?.balance.previous,
                "upIsGood",
                projectedEnd === null || projectedEnd === undefined
                  ? undefined
                  : {
                      testID: overviewTestIds.balanceProjectedEnd,
                      text: `${t("financial.overview.balance.projectedEnd", { date: formatDay(vm.period.to, localeTag) })}: ${money(projectedEnd)}`,
                    },
              )}
              {tile(
                "income",
                t("financial.overview.tiles.income"),
                income,
                summary?.income.previous,
                "upIsGood",
              )}
              {tile(
                "expense",
                t("financial.overview.tiles.expense"),
                expense,
                summary?.expense.previous,
                "upIsBad",
              )}
              {tile(
                "result",
                t("financial.overview.tiles.result"),
                income - expense,
                summary
                  ? summary.income.previous - summary.expense.previous
                  : undefined,
                "upIsGood",
              )}
            </View>
            {vm.noTransactions ? (
              <EmptyState
                actionLabel={t("financial.overview.empty.newTransaction")}
                icon="chart-box-outline"
                message={t("financial.overview.empty.body")}
                onAction={vm.onNewTransaction}
                testID={overviewTestIds.empty}
                title={t("financial.overview.empty.title")}
              />
            ) : (
              <>
                <BalanceBlock compact={compact} vm={vm} />
                <IncomeExpenseBlock compact={compact} vm={vm} />
                <CategoriesBlock vm={vm} />
                <TagsBlock vm={vm} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
      {vm.filtersOpen && (
        <FiltersModal
          archivedOwnerIds={vm.archivedOwnerIds}
          filters={vm.filterStore.filters}
          hidePeriod
          onApply={vm.filterStore.replace}
          onClose={vm.onFiltersClose}
          ownerIds={vm.allOwnerIds}
          scopeOwnerIds={vm.ownerIds}
        />
      )}
      {vm.customOpen && (
        <CustomPeriodSheet
          initial={vm.period}
          onApply={vm.onApplyCustomPeriod}
          onClose={vm.onCustomClose}
          today={vm.today}
        />
      )}
    </View>
  );
}

export default FinancialOverview;
