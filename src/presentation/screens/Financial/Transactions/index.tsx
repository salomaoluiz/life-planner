import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AmountText,
  ChipGroup,
  EmptyState,
  ErrorState,
  GroupHeader,
  SegmentedControl,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import AdjustmentSheet from "./components/AdjustmentSheet";
import MonthPickerSheet from "./components/MonthPickerSheet";
import MonthSummary from "./components/MonthSummary";
import MonthSwitcher from "./components/MonthSwitcher";
import TransactionRow from "./components/TransactionRow";
import { useTransactionsViewModel } from "./hooks";
import useAdjustmentSheet from "./hooks/useAdjustmentSheet";
import {
  ALL_FILTER,
  formatDayTitle,
  ListEntry,
  netAmount,
} from "./models/transactionList";
import useStyles from "./styles";
import transactionsTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialTransactions() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useTransactionsViewModel();
  const adjustment = useAdjustmentSheet({ onDeleted: vm.onRefresh });

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
      const transaction = item.item;

      return (
        <TransactionRow
          item={transaction}
          onPress={
            transaction.isAdjustment
              ? () => adjustment.onOpen(transaction)
              : vm.onRowPress
          }
        />
      );
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

  const scopeOptions = translateChoices(vm.scopeChoices, t).map((option) => ({
    ...option,
    icon: scopeIcon(option.value, vm.personalOwnerId),
  }));
  const scopeLabel =
    vm.ownerFilter === ALL_FILTER
      ? t("financial.transactions.scope.all")
      : (scopeOptions.find((option) => option.value === vm.ownerFilter)
          ?.label ?? t("financial.transactions.scope.all"));
  const typeOptions = [
    { label: t("financial.common.all"), tone: "accent" as const, value: "ALL" },
    {
      label: t("financial.common.expenses"),
      tone: "expense" as const,
      value: "EXPENSE",
    },
    {
      label: t("financial.common.incomes"),
      tone: "income" as const,
      value: "INCOME",
    },
  ];

  const toolbar = (
    <View style={styles.toolbar} testID="transactions-toolbar">
      <MonthSwitcher
        monthLabel={vm.monthLabel}
        nextLabel={t("financial.transactions.nextMonth")}
        nextTestID={transactionsTestIds.monthNext}
        onMonthPress={vm.onMonthPickerOpen}
        onNext={vm.onNextMonth}
        onPrevious={vm.onPreviousMonth}
        previousLabel={t("financial.transactions.previousMonth")}
        previousTestID={transactionsTestIds.monthPrevious}
      />
      <View accessibilityLabel={t("financial.transactions.scope.label")}>
        <ChipGroup
          layout={"scroll"}
          mode={"single"}
          onChange={vm.onOwnerFilterChange}
          options={scopeOptions}
          testID={transactionsTestIds.scopeFilter}
          value={vm.ownerFilter}
        />
      </View>
      <MonthSummary
        balanceCents={vm.summary?.balanceCents ?? 0}
        balanceLabel={t("financial.transactions.balanceOf", {
          month: vm.monthName,
        })}
        errorMessage={t("common.errors.generic")}
        expenseCents={vm.summary?.expenseCents ?? 0}
        expensesLabel={t("financial.common.expenses")}
        expenseTestID={transactionsTestIds.summaryExpense}
        incomeCents={vm.summary?.incomeCents ?? 0}
        incomesLabel={t("financial.common.incomes")}
        incomeTestID={transactionsTestIds.summaryIncome}
        isError={vm.summaryError}
        isLoading={!vm.summary && !vm.summaryError}
        onRetry={vm.onSummaryRetry}
        retryLabel={t("common.actions.tryAgain")}
        scopeLabel={scopeLabel}
        scopeTestID={transactionsTestIds.summaryScope}
        testID={transactionsTestIds.monthSummary}
      />
      <SegmentedControl
        accessibilityLabel={t("financial.transactions.typeFilter.label")}
        onChange={vm.onTypeFilterChange}
        options={typeOptions}
        testID={transactionsTestIds.typeFilter}
        value={vm.typeFilter}
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
      <View style={styles.root} testID={transactionsTestIds.screen}>
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
        testID={transactionsTestIds.emptyMonth}
        title={t("financial.transactions.emptyTitle", { month: vm.monthLabel })}
      />
    );
  } else if (vm.isFilteredEmpty) {
    empty = (
      <EmptyState
        actionLabel={t("financial.common.clearFilters")}
        message={t("financial.transactions.noMatchMessage")}
        onAction={vm.onClearFilters}
        testID={transactionsTestIds.filteredEmpty}
        title={t("financial.transactions.noMatch")}
      />
    );
  }

  return (
    <View style={styles.root} testID={transactionsTestIds.screen}>
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
        showsVerticalScrollIndicator={false}
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
      {adjustment.item && (
        <AdjustmentSheet
          accountName={adjustment.item.accountName}
          amountCents={adjustment.item.amountCents}
          amountType={adjustment.item.amountType}
          cancelLabel={t("common.actions.cancel")}
          closeLabel={t("common.actions.close")}
          confirmLabel={t("common.actions.delete")}
          deleteLabel={t("financial.transactions.delete")}
          deleteMessage={t("financial.transactions.adjustmentDeleteMessage")}
          deleteTitle={t("financial.transactions.deleteTitle")}
          errorMessage={
            adjustment.errorKey ? t(adjustment.errorKey) : undefined
          }
          isDeleting={adjustment.isDeleting}
          onClose={adjustment.onClose}
          onDelete={adjustment.onDelete}
          title={t("financial.transactions.adjustment")}
        />
      )}
    </View>
  );
}

function scopeIcon(value: string, personalOwnerId?: string) {
  if (value === ALL_FILTER) {
    return undefined;
  }

  return value === personalOwnerId ? "account" : "account-group";
}

export default FinancialTransactions;
