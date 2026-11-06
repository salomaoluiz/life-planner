import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { View } from "react-native";

import {
  AmountText,
  Chip,
  ChipGroup,
  EmptyState,
  ErrorState,
  Fab,
  GroupHeader,
  Icon,
  ReadOnlyNotice,
  SegmentedControl,
  Text,
  Toast,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import useStableCallback from "@presentation/hooks/useStableCallback";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { useBreakpoint } from "@presentation/theme";
import { useFinancialHeaderActions } from "@screens/Financial/Layout/headerActions";
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
import ExportModal from "./modals/ExportModal";
import FiltersModal from "./modals/FiltersModal";
import ImportWizard from "./modals/ImportWizard";
import { buildActiveChips, formatPeriod } from "./models/filterLabels";
import {
  ALL_FILTER,
  formatDayTitle,
  ListEntry,
  netAmount,
} from "./models/transactionList";
import TransactionUIModel from "./models/TransactionUIModel";
import useStyles from "./styles";
import transactionsTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function entryKey(entry: ListEntry) {
  return entry.key;
}

function entryType(entry: ListEntry) {
  return entry.kind;
}

function FinancialTransactions() {
  const wide = useBreakpoint() !== "compact";
  const { styles } = useStyles(wide);
  const { t } = useTranslation();
  const { colors } = useKitTheme();
  const localeTag = useLocaleTag();
  const vm = useTransactionsViewModel();
  const adjustment = useAdjustmentSheet();
  const pay = usePayTransaction();
  const csv = useCsvActions();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersStep, setFiltersStep] = useState<"period" | "root">("root");
  // FlashList only lays the sticky headers out on a scroll event: at the top it pins the first day header over the
  // month switcher until the first scroll. They are off while the list sits at the top.
  const [scrolled, setScrolled] = useState(false);
  function openFilters(step: "period" | "root" = "root") {
    setFiltersStep(step);
    setFiltersOpen(true);
  }
  // Spec 050: Import/Export CSV live in the ⋮ button of the Finances header (slot owned by the layout).
  useFinancialHeaderActions(
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
    />,
    `${csv.menuOpen}|${wide}|${localeTag}`,
  );
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

  // Spec 087: handlers by item, with a stable identity, so the memoized rows keep their render.
  const onPayRow = useStableCallback((item: TransactionUIModel) =>
    vm.readOnly ? vm.onReadOnlyAttempt() : pay.openFor(item),
  );
  const onAdjustmentPress = useStableCallback((item: TransactionUIModel) =>
    vm.readOnly ? vm.onReadOnlyAttempt() : adjustment.onOpen(item),
  );

  // A stable identity too: FlashList renders the cells again when `extraData` changes, and each one calls the latest.
  const renderItem = useStableCallback(({ item }: { item: ListEntry }) => {
    if (item.kind === "invoice") {
      return (
        <CardInvoiceRow
          expanded={vm.expandedInvoiceId === item.invoice.id}
          invoice={item.invoice}
          onOpen={vm.onInvoiceOpen}
          onProjectedPress={vm.onProjectedPress}
          onPurchasePress={vm.onRowPress}
          onToggle={vm.onInvoiceToggle}
          updating={vm.isTotalsUpdating}
        />
      );
    }

    if (item.kind === "item") {
      const transaction = item.item;

      return (
        <TransactionRow
          item={transaction}
          onAdjustmentPress={onAdjustmentPress}
          onPay={onPayRow}
          onPress={vm.onRowPress}
          onProjectedPress={vm.onProjectedPress}
        />
      );
    }

    if (item.kind === "balanceLine") {
      return (
        <DayBalanceLine
          accountId={item.accountId}
          balanceCents={item.balanceCents}
          favorite={item.favorite}
          icon={item.icon}
          isCards={item.isCards}
          isLast={item.isLast}
          name={item.name}
          updating={vm.isTotalsUpdating}
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
    const day = vm.balances.get(item.dateKey);
    const title = dayTitle(item);
    // Spec 094: a collapsed header shows the favorite's balance, an expanded one (and the tooltip) the total.
    const favoriteDay = vm.favorite
      ? day?.accounts.find((account) => account.accountId === vm.favorite?.id)
      : undefined;
    const showFavorite = !!favoriteDay && !expanded;
    const shownCents = showFavorite
      ? favoriteDay.balanceCents
      : item.balanceCents;
    const balanceNegative = shownCents < 0;

    return (
      <GroupHeader
        accessibilityLabel={t(
          showFavorite
            ? "financial.transactions.dayBalance.a11yFavorite"
            : "financial.transactions.dayBalance.a11y",
          {
            day: title,
            name: vm.favorite?.name,
            value: formatAmount(
              Math.abs(shownCents),
              localeTag,
              DEFAULT_CURRENCY,
              balanceNegative ? "EXPENSE" : undefined,
            ),
          },
        )}
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
              {sortedAccounts(day.accounts, vm.favorite?.id).map((account) => (
                <DayBalanceLine
                  accountId={account.accountId}
                  balanceCents={account.balanceCents}
                  favorite={account.accountId === vm.favorite?.id}
                  icon={account.icon}
                  isCards={false}
                  key={account.accountId}
                  name={account.name}
                  updating={vm.isTotalsUpdating}
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
              {vm.favorite && favoriteDay ? (
                <View style={styles.tooltipTotal}>
                  <Text.Caption
                    tone={"secondary"}
                    value={t("financial.transactions.dayBalance.total")}
                  />
                  <AmountText
                    currency={DEFAULT_CURRENCY}
                    size={"body"}
                    type={day.totalCents < 0 ? "EXPENSE" : undefined}
                    value={Math.abs(day.totalCents)}
                  />
                </View>
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
                {showFavorite ? (
                  <View
                    style={styles.favoriteLabel}
                    testID={`${transactionsTestIds.dayBalanceFavorite}-${item.dateKey}`}
                  >
                    <Icon color={colors.warning} name={"star"} size={13} />
                    <Text.Overline
                      numberOfLines={1}
                      tone={"secondary"}
                      value={vm.favorite?.name ?? ""}
                    />
                  </View>
                ) : (
                  <Text.Overline
                    tone={"secondary"}
                    value={t(
                      favoriteDay
                        ? "financial.transactions.dayBalance.total"
                        : "financial.transactions.dayBalance.label",
                    )}
                  />
                )}
              </View>
              <AmountText
                currency={DEFAULT_CURRENCY}
                size={"body"}
                type={balanceNegative ? "EXPENSE" : undefined}
                value={Math.abs(shownCents)}
              />
            </View>
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} />
          </View>
        }
      />
    );
  });

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
          updating={vm.isTotalsUpdating}
        />
      ) : (
        <MonthSummary
          balanceCents={vm.summary?.balanceCents ?? 0}
          balanceLabel={t("financial.transactions.balanceOf", {
            month: vm.monthName,
          })}
          columns={vm.summaryColumns?.map((column) => ({
            ...column,
            label:
              column.key === "favorite"
                ? (vm.favorite?.name ?? "")
                : t("financial.transactions.summary.total"),
          }))}
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
          rowA11yLabel={(label, values) =>
            t("financial.transactions.summary.rowA11y", {
              label,
              name: vm.favorite?.name ?? "",
              total: values[1] ?? values[0],
              value: values[0],
            })
          }
          scopeLabel={scopeLabel}
          scopeTestID={transactionsTestIds.summaryScope}
          tableLabels={{
            expenses: t("financial.common.expenses"),
            income: t("financial.common.incomes"),
            projected: t("financial.transactions.summary.projected"),
            result: t("financial.transactions.summary.result"),
            toPay: t("financial.transactions.summary.toPay"),
            toReceive: t("financial.transactions.summary.toReceive"),
          }}
          tableTestID={transactionsTestIds.summaryTable}
          testID={transactionsTestIds.monthSummary}
          toPayCents={vm.summary?.toPayCents}
          toPayLabel={t("financial.transactions.summary.toPay")}
          toPayTestID={transactionsTestIds.summaryToPay}
          toReceiveCents={vm.summary?.toReceiveCents}
          toReceiveLabel={t("financial.transactions.summary.toReceive")}
          toReceiveTestID={transactionsTestIds.summaryToReceive}
          updating={vm.isTotalsUpdating}
        />
      )}
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

  const fab = (
    <View pointerEvents={"box-none"} style={styles.fab}>
      <Fab
        extended={wide}
        label={t("financial.transactions.fab")}
        onPress={vm.onAddPress}
        testID={transactionsTestIds.fab}
      />
    </View>
  );

  if (vm.errorMessage) {
    return (
      <View style={styles.root}>
        <ErrorState
          message={vm.errorMessage}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
        {fab}
      </View>
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
        contentContainerStyle={styles.listContent}
        data={vm.entries}
        estimatedItemSize={64}
        // Expanding an invoice only changes this id: without it the virtualized row keeps its old render.
        extraData={`${vm.expandedInvoiceId ?? ""}|${vm.expandedDayKey ?? ""}|${vm.isTotalsUpdating}|${vm.readOnly}|${localeTag}|${wide}`}
        getItemType={entryType}
        keyExtractor={entryKey}
        ListEmptyComponent={empty}
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        onScroll={(event) => {
          const isScrolled = event.nativeEvent.contentOffset.y > 0;

          if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
          }
        }}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={scrolled ? vm.stickyIndices : []}
      />
      {fab}
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
      {csv.importOpen && (
        <ImportWizard
          onClose={csv.onImportClose}
          onImported={(count) => {
            csv.onImported(count);
            vm.onRefresh();
          }}
          owners={vm.owners}
          screenOwner={vm.ownerFilter}
        />
      )}
      <Toast
        message={t(
          pluralKey("financial.import.toast.imported", csv.importedCount ?? 0),
          { count: csv.importedCount ?? 0 },
        )}
        onHide={csv.onImportedHide}
        testID={transactionsTestIds.importToast}
        visible={csv.importedCount !== undefined}
      />
      {filtersOpen && (
        <FiltersModal
          archivedOwnerIds={vm.archivedOwnerIds}
          filters={vm.filters}
          initialStep={filtersStep}
          onApply={vm.onFiltersApply}
          onClose={() => setFiltersOpen(false)}
          ownerIds={vm.allOwnerIds}
          scopeOwnerIds={vm.scopeOwnerIds}
          typeFirst={vm.typeFilter === "ALL" ? undefined : vm.typeFilter}
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
          isDeleting={false}
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

// The favorite account first, the others keep the API order (spec 094 FR 25).
function sortedAccounts<T extends { accountId: string }>(
  accounts: T[],
  favoriteId?: string,
): T[] {
  return [...accounts].sort(
    (a, b) =>
      Number(b.accountId === favoriteId) - Number(a.accountId === favoriteId),
  );
}

export default FinancialTransactions;
