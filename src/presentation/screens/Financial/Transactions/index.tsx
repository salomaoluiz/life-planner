import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AmountText,
  ChipGroup,
  EmptyState,
  ErrorState,
  GroupHeader,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import MonthPickerSheet from "./components/MonthPickerSheet";
import MonthSummary from "./components/MonthSummary";
import MonthSwitcher from "./components/MonthSwitcher";
import TransactionRow from "./components/TransactionRow";
import { useTransactionsViewModel } from "./hooks";
import { formatDayTitle, ListEntry, netAmount } from "./models/transactionList";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialTransactions() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useTransactionsViewModel();

  function dayTitle(entry: Extract<ListEntry, { kind: "header" }>) {
    if (entry.label.kind === "today") {
      return t("financial.transactions.today");
    }
    if (entry.label.kind === "yesterday") {
      return t("financial.transactions.yesterday");
    }
    return formatDayTitle(entry.label.date, vm.languageTag);
  }

  function renderItem({ item }: { item: ListEntry }) {
    if (item.kind === "item") {
      return <TransactionRow item={item.item} onPress={vm.onRowPress} />;
    }

    const net = netAmount(item.netCents);
    return (
      <GroupHeader
        testID={`day-header-${item.key}`}
        title={dayTitle(item)}
        trailing={
          <AmountText size={"body"} type={net.type} value={net.value} />
        }
      />
    );
  }

  const toolbar = (
    <View style={styles.toolbar}>
      <MonthSwitcher
        monthLabel={vm.monthLabel}
        nextLabel={t("financial.transactions.nextMonth")}
        onMonthPress={vm.onMonthPickerOpen}
        onNext={vm.onNextMonth}
        onPrevious={vm.onPreviousMonth}
        previousLabel={t("financial.transactions.previousMonth")}
      />
      <MonthSummary
        balanceCents={vm.summary?.balanceCents ?? 0}
        balanceLabel={t("financial.common.balance")}
        errorMessage={t("common.errors.generic")}
        expenseCents={vm.summary?.expenseCents ?? 0}
        expensesLabel={t("financial.common.expenses")}
        incomeCents={vm.summary?.incomeCents ?? 0}
        incomesLabel={t("financial.common.incomes")}
        isError={vm.summaryError}
        isLoading={!vm.summary && !vm.summaryError}
        onRetry={vm.onSummaryRetry}
        retryLabel={t("common.actions.tryAgain")}
      />
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onFilterChange}
        options={translateChoices(vm.filterChoices, t)}
        value={vm.filter}
      />
    </View>
  );

  if (vm.errorMessage) {
    return (
      <ErrorState
        message={vm.errorMessage}
        onRetry={vm.onRetry}
        retryLabel={t("common.actions.tryAgain")}
      />
    );
  }

  if (vm.isLoading) {
    return (
      <View style={styles.root}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"transactions-skeleton"} />
        ))}
      </View>
    );
  }

  let empty = null;
  if (vm.isEmptyMonth) {
    empty = (
      <EmptyState
        actionLabel={t("financial.transactions.add")}
        message={t("financial.transactions.emptyMessage")}
        onAction={vm.onAddPress}
        title={t("financial.transactions.emptyTitle", { month: vm.monthLabel })}
      />
    );
  } else if (vm.isFilteredEmpty) {
    empty = (
      <EmptyState
        actionLabel={t("financial.common.clearFilters")}
        message={t("financial.transactions.noMatchMessage")}
        onAction={vm.onClearFilters}
        title={t("financial.transactions.noMatch")}
      />
    );
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={vm.entries}
        estimatedItemSize={64}
        getItemType={(entry) => entry.kind}
        keyExtractor={(entry) => entry.key}
        ListEmptyComponent={empty}
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
        stickyHeaderIndices={vm.stickyIndices}
      />
      {vm.isMonthPickerOpen && (
        <MonthPickerSheet
          closeLabel={t("common.actions.close")}
          months={vm.monthChoices}
          nextYearLabel={t("financial.transactions.monthPicker.nextYear")}
          onClose={vm.onMonthPickerClose}
          onSelect={vm.onMonthSelect}
          onYearChange={vm.onPickerYearChange}
          previousYearLabel={t(
            "financial.transactions.monthPicker.previousYear",
          )}
          selected={vm.selectedMonthIndex}
          title={t("financial.transactions.monthPicker.title")}
          year={vm.pickerYear}
        />
      )}
    </View>
  );
}

export default FinancialTransactions;
