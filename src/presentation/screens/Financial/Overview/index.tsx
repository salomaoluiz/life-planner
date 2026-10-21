import { ScrollView, View } from "react-native";

import { EmptyState, StatTile } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import { FiltersModal } from "@screens/Financial/Transactions/modals";

import BalanceBlock from "./components/BalanceBlock";
import CategoriesBlock from "./components/CategoriesBlock";
import CustomPeriodSheet from "./components/CustomPeriodSheet";
import IncomeExpenseBlock from "./components/IncomeExpenseBlock";
import OverviewToolbar from "./components/OverviewToolbar";
import TagsBlock from "./components/TagsBlock";
import { useOverviewViewModel } from "./hooks";
import { deltaOf } from "./models/overviewFormat";
import useStyles from "./styles";
import overviewTestIds from "./testIds";

function FinancialOverview() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const breakpoint = useBreakpoint();
  const compact = breakpoint === "compact";
  const wide = breakpoint === "expanded";
  const vm = useOverviewViewModel();
  const currency = vm.currency as CurrencyCode;
  const summary = vm.summary.data;
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  const note = t("financial.overview.tiles.vsPrevious");
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
  ) {
    return (
      <View style={styles.tile}>
        <StatTile
          delta={{ ...deltaOf(value, previous, direction, localeTag), note }}
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
            <View style={styles.tiles}>
              {tile(
                "balance",
                t("financial.overview.tiles.balance"),
                summary?.balance.current ?? 0,
                summary?.balance.previous,
                "upIsGood",
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
                <View style={wide ? styles.twoColumns : styles.blocks}>
                  <View style={wide ? styles.column : undefined}>
                    <IncomeExpenseBlock compact={compact} vm={vm} />
                  </View>
                  <View style={wide ? styles.column : undefined}>
                    <CategoriesBlock vm={vm} />
                  </View>
                </View>
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
