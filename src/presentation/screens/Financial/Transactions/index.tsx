import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { View } from "react-native";

import {
  AmountText,
  Chip,
  ChipGroup,
  EmptyState,
  ErrorState,
  GroupHeader,
  Icon,
  ReadOnlyNotice,
  SegmentedControl,
  Text,
  Toast,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import AdjustmentSheet from "./components/AdjustmentSheet";
import CardInvoiceRow from "./components/CardInvoiceRow";
import CsvActions from "./components/CsvActions";
import DayBalanceLine from "./components/DayBalanceLine";
import FilteredSummary from "./components/FilteredSummary";
import FilterToolbar from "./components/FilterToolbar";
import MonthPickerSheet from "./components/MonthPickerSheet";
import MonthSummary from "./components/MonthSummary";
import MonthSwitcher from "./components/MonthSwitcher";
import TransactionRow from "./components/TransactionRow";
import { useTransactionsViewModel } from "./hooks";
import useAdjustmentSheet from "./hooks/useAdjustmentSheet";
import useCsvActions from "./hooks/useCsvActions";
import useFilterOptions from "./hooks/useFilterOptions";
import usePayTransaction from "./hooks/usePayTransaction";
import { ExportModal, FiltersModal } from "./modals";
import { buildActiveChips, formatPeriod } from "./models/filterLabels";
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
  const localeTag = useLocaleTag();
  const wide = useBreakpoint() !== "compact";
  const vm = useTransactionsViewModel();
  const adjustment = useAdjustmentSheet({ onDeleted: vm.onRefresh });
  const pay = usePayTransaction({ onPaid: vm.onRefresh });
  const csv = useCsvActions();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersStep, setFiltersStep] = useState<"period" | "root">("root");
  function openFilters(step: "period" | "root" = "root") {
    setFiltersStep(step);
    setFiltersOpen(true);
  }
  const filterOptions = useFilterOptions(vm.allOwnerIds, vm.filterCount > 0);
  const filterChips = buildActiveChips(
    vm.filters,
    {
      categories: new Map(
        filterOptions.categoryDtos.map((item) => [item.id, item.name]),
      ),
      sources: new Map(
        filterOptions.sources.map((item) => [item.id, item.name]),
      ),
      tags: new Map(filterOptions.tags.map((item) => [item.id, item.name])),
    },
    localeTag,
    t,
  );

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
    if (item.kind === "invoice") {
      return (
        <CardInvoiceRow
          expanded={vm.expandedInvoiceId === item.invoice.id}
          invoice={item.invoice}
          onOpen={vm.onInvoiceOpen}
          onProjectedPress={vm.onProjectedPress}
          onPurchasePress={vm.onRowPress}
          onToggle={vm.onInvoiceToggle}
        />
      );
    }

    if (item.kind === "item") {
      const transaction = item.item;

      return (
        <TransactionRow
          isPaying={pay.payingId === transaction.id}
          item={transaction}
          onPay={vm.readOnly ? vm.onReadOnlyAttempt : pay.onPay}
          onPress={
            transaction.isAdjustment
              ? () =>
                  vm.readOnly
                    ? vm.onReadOnlyAttempt()
                    : adjustment.onOpen(transaction)
              : vm.onRowPress
          }
          onProjectedPress={vm.onProjectedPress}
        />
      );
    }

    if (item.kind === "balanceLine") {
      return (
        <DayBalanceLine
          accountId={item.accountId}
          balanceCents={item.balanceCents}
          icon={item.icon}
          isCards={item.isCards}
          isLast={item.isLast}
          name={item.name}
        />
      );
    }

    const net = netAmount(item.netCents);

    if (item.balanceCents === undefined) {
      return (
        <GroupHeader
          testID={`day-header-${item.key}`}
          title={dayTitle(item)}
          trailing={
            <AmountText
              currency={DEFAULT_CURRENCY}
              size={"body"}
              type={net.type}
              value={net.value}
            />
          }
        />
      );
    }

    const expanded = vm.expandedDayKey === item.dateKey;
    const balanceNegative = item.balanceCents < 0;
    const day = vm.balances.get(item.dateKey);
    const title = dayTitle(item);

    return (
      <GroupHeader
        accessibilityLabel={t("financial.transactions.dayBalance.a11y", {
          day: title,
          value: formatAmount(
            Math.abs(item.balanceCents),
            localeTag,
            DEFAULT_CURRENCY,
            balanceNegative ? "EXPENSE" : undefined,
          ),
        })}
        expanded={expanded}
        meta={
          <View style={styles.net}>
            <AmountText
              currency={DEFAULT_CURRENCY}
              size={"caption"}
              type={net.type}
              value={net.value}
            />
            <Text.Caption
              tone={"secondary"}
              value={t("financial.transactions.dayBalance.netSuffix")}
            />
          </View>
        }
        onPress={() => vm.onDayToggle(item.dateKey)}
        testID={`${transactionsTestIds.dayBalance}-${item.dateKey}`}
        title={title}
        tooltip={
          expanded || !day ? undefined : (
            <View style={styles.tooltip}>
              <Text.Overline
                tone={"secondary"}
                value={t("financial.transactions.dayBalance.title")}
              />
              {day.accounts.map((account) => (
                <DayBalanceLine
                  accountId={account.accountId}
                  balanceCents={account.balanceCents}
                  icon={account.icon}
                  isCards={false}
                  key={account.accountId}
                  name={account.name}
                  variant={"tooltip"}
                />
              ))}
              {day.cardsDueCents !== 0 ? (
                <DayBalanceLine
                  balanceCents={day.cardsDueCents}
                  icon={"credit-card-outline"}
                  isCards
                  name={""}
                  variant={"tooltip"}
                />
              ) : null}
              <Text.Caption
                tone={"secondary"}
                value={t("financial.transactions.dayBalance.pinHint")}
              />
            </View>
          )
        }
        trailing={
          <View style={styles.balance}>
            <View style={styles.balanceColumn}>
              <View style={styles.balanceLabel}>
                {item.projected ? (
                  <Text.Caption
                    testID={transactionsTestIds.dayBalanceProjected}
                    tone={"secondary"}
                    value={t("financial.recurrence.projected")}
                  />
                ) : null}
                <Text.Overline
                  tone={"secondary"}
                  value={t("financial.transactions.dayBalance.label")}
                />
              </View>
              <AmountText
                currency={DEFAULT_CURRENCY}
                size={"body"}
                type={balanceNegative ? "EXPENSE" : undefined}
                value={Math.abs(item.balanceCents)}
              />
            </View>
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} />
          </View>
        }
      />
    );
  }

  const scopeOptions = translateChoices(vm.scopeChoices, t).map((option) => ({
    ...option,
    icon: option.icon ?? scopeIcon(option.value, vm.personalOwnerId),
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

  const scopeChips = (
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
  );
  const toolbar = (
    <View style={styles.toolbar} testID="transactions-toolbar">
      <CsvActions
        closeLabel={t("common.actions.close")}
        exportLabel={t("financial.export.action")}
        importLabel={t("financial.import.action")}
        menuLabel={t("financial.export.menu")}
        menuOpen={csv.menuOpen}
        onExport={csv.onExportOpen}
        onImport={csv.onImportOpen}
        onMenuClose={csv.onMenuClose}
        onMenuOpen={csv.onMenuOpen}
        wide={wide}
      />
      {vm.filters.period ? (
        <View style={styles.periodChip}>
          <Chip
            accessibilityLabel={t(
              "financial.transactions.filters.periodChipA11y",
              {
                range: formatPeriod(vm.filters.period, localeTag),
              },
            )}
            icon={"calendar-range"}
            label={formatPeriod(vm.filters.period, localeTag)}
            onPress={() => openFilters("period")}
            selected
            testID={transactionsTestIds.periodChip}
          />
        </View>
      ) : (
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
      )}
      {wide ? null : scopeChips}
      <FilterToolbar
        chips={filterChips}
        clearAllLabel={t("financial.transactions.filters.clearAll")}
        count={vm.filterCount}
        filtersA11y={t("financial.transactions.filters.a11y", {
          count: vm.filterCount,
        })}
        filtersLabel={t("financial.transactions.filters.button")}
        leading={scopeChips}
        onChipRemove={vm.onFilterRemove}
        onClearAll={vm.onFiltersClear}
        onFiltersPress={() => openFilters()}
        onSearchChange={vm.onSearchChange}
        removeLabel={(name) =>
          t("financial.transactions.filters.remove", { name })
        }
        searchClearLabel={t("common.actions.clear")}
        searchPlaceholder={t(
          "financial.transactions.filters.searchPlaceholder",
        )}
        searchValue={vm.filters.search}
      />
      {vm.filtering && vm.filteredSummary ? (
        <FilteredSummary
          caption={`${t("financial.transactions.filters.count", {
            count: vm.filteredSummary.count,
          })} · ${t("financial.transactions.filters.resultOf")}`}
          expensesLabel={t("financial.common.expenses")}
          incomesLabel={t("financial.common.incomes")}
          resultLabel={t("financial.transactions.filters.result")}
          summary={vm.filteredSummary}
        />
      ) : (
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
          projectedExpenseCents={vm.summary?.projectedExpenseCents}
          projectedIncomeCents={vm.summary?.projectedIncomeCents}
          projectedLabel={t("financial.transactions.summary.projected")}
          projectedTestID={transactionsTestIds.summaryProjected}
          retryLabel={t("common.actions.tryAgain")}
          scopeLabel={scopeLabel}
          scopeTestID={transactionsTestIds.summaryScope}
          testID={transactionsTestIds.monthSummary}
          toPayCents={vm.summary?.toPayCents}
          toPayLabel={t("financial.transactions.summary.toPay")}
          toPayTestID={transactionsTestIds.summaryToPay}
          toReceiveCents={vm.summary?.toReceiveCents}
          toReceiveLabel={t("financial.transactions.summary.toReceive")}
          toReceiveTestID={transactionsTestIds.summaryToReceive}
        />
      )}
      {pay.hasError ? (
        <Text.Body tone={"expense"} value={t("common.errors.generic")} />
      ) : null}
      {vm.invoicesError ? (
        <ErrorState
          message={t("financial.transactions.cardInvoice.error")}
          onRetry={vm.onInvoiceRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={transactionsTestIds.cardInvoiceError}
        />
      ) : null}
      {vm.readOnly ? (
        <ReadOnlyNotice
          message={t("family.archived.banner")}
          testID={transactionsTestIds.readOnlyBanner}
        />
      ) : null}
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
  if (vm.filtersError) {
    empty = (
      <ErrorState
        message={vm.filtersError}
        onRetry={async () => vm.onRefresh()}
        retryLabel={t("common.actions.tryAgain")}
      />
    );
  } else if (vm.filtersLoading) {
    empty = (
      <View>
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"transactions-skeleton"} />
        ))}
      </View>
    );
  } else if (vm.filtersEmpty) {
    empty = (
      <EmptyState
        actionLabel={t("financial.transactions.filters.empty.action")}
        message={t("financial.transactions.filters.empty.body")}
        onAction={vm.onFiltersClear}
        testID={transactionsTestIds.filtersEmpty}
        title={t("financial.transactions.filters.empty.title")}
      />
    );
  } else if (vm.isEmptyMonth) {
    empty = (
      <EmptyState
        actionLabel={vm.readOnly ? undefined : t("financial.transactions.add")}
        message={t("financial.transactions.emptyMessage")}
        onAction={vm.readOnly ? undefined : vm.onAddPress}
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
        // Expanding an invoice only changes this id: without it the virtualized row keeps its old render.
        extraData={`${vm.expandedInvoiceId ?? ""}|${vm.expandedDayKey ?? ""}`}
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
      {csv.exportOpen && (
        <ExportModal onClose={csv.onExportClose} owners={vm.owners} />
      )}
      {filtersOpen && (
        <FiltersModal
          archivedOwnerIds={vm.archivedOwnerIds}
          filters={vm.filters}
          initialStep={filtersStep}
          onApply={vm.onFiltersApply}
          onClose={() => setFiltersOpen(false)}
          ownerIds={vm.allOwnerIds}
          scopeOwnerIds={vm.scopeOwnerIds}
        />
      )}
      <Toast
        icon={"lock-outline"}
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        testID={transactionsTestIds.readOnlyToast}
        visible={vm.toastVisible}
      />
      {adjustment.item && (
        <AdjustmentSheet
          accountName={adjustment.item.accountName}
          amountCents={adjustment.item.amountCents}
          amountType={adjustment.item.amountType}
          cancelLabel={t("common.actions.cancel")}
          closeLabel={t("common.actions.close")}
          confirmLabel={t("common.actions.delete")}
          currency={adjustment.item.currency}
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
