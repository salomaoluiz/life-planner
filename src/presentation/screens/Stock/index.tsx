import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  Badge,
  BottomSheet,
  Button,
  ChipGroup,
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  ListItem,
  Screen,
  ScreenHeader,
  SearchField,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import StockItemDetails from "@screens/Stock/containers/StockItemDetails";
import { StockListRow } from "@screens/Stock/models/StockListUIModel";

import { useStockViewModel } from "./hooks";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function Stock() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useStockViewModel();

  const hasContent = !vm.isLoading && !vm.errorMessageKey && !vm.isEmpty;
  let subtitle: string | undefined;
  if (hasContent) {
    subtitle = vm.subtitle.attention
      ? t("stock.list.subtitleAttention", vm.subtitle)
      : t("stock.list.subtitle", { total: vm.subtitle.total });
  }

  function renderRow({ item: row }: { item: StockListRow }) {
    if (row.kind === "header") {
      return <Text.Overline value={t(row.titleKey)} />;
    }

    const { item } = row;
    const date = item.dateInfo
      ? t(item.dateInfo.key, { date: item.dateInfo.date })
      : "";
    const quantity = `${item.quantityText} ${t(item.unitKey)}`;
    const badge = item.badge;
    const status = badge ? t(badge.labelKey, badge.params) : "";

    return (
      <ListItem
        accessibilityLabel={t("stock.list.rowA11y", {
          name: item.description,
          quantity,
          status,
        })}
        leading={
          <IconTile name={item.iconTile.icon} tone={item.iconTile.tone} />
        }
        onPress={() => vm.onItemPress(item.id)}
        subtitle={[item.ownerName, date].filter(Boolean).join(" · ")}
        testID={`stock-row-${item.id}`}
        title={item.description}
        trailing={
          badge ? (
            <Badge label={status} tone={badge.tone} />
          ) : (
            <Text.Caption value={quantity} />
          )
        }
      />
    );
  }

  function renderEmpty() {
    if (vm.isLoading) {
      return (
        <View testID="stock-skeleton">
          {SKELETON_ROWS.map((key) => (
            <Skeleton.ListItem key={key} />
          ))}
        </View>
      );
    }

    if (vm.errorMessageKey) {
      return (
        <ErrorState
          message={t(vm.errorMessageKey)}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
      );
    }

    if (vm.isEmpty) {
      return (
        <EmptyState
          actionLabel={t("stock.list.add")}
          message={t("stock.list.emptyMessage")}
          onAction={vm.onAddPress}
          title={t("stock.list.emptyTitle")}
        />
      );
    }

    return (
      <View style={styles.noResults}>
        <Text.Body align="center" value={t("stock.list.noResults")} />
        <Button.Ghost
          label={t("stock.list.clearFilters")}
          onPress={vm.onClearFilters}
        />
      </View>
    );
  }

  return (
    <Screen
      list={
        <FlashList
          data={vm.rows}
          getItemType={(row: StockListRow) => row.kind}
          keyExtractor={(row: StockListRow) => row.id}
          ListEmptyComponent={renderEmpty()}
          renderItem={renderRow}
          testID="flashList"
        />
      }
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      testID="stock"
    >
      <View style={styles.header}>
        <ScreenHeader
          actions={
            <>
              {hasContent ? (
                <IconButton
                  accessibilityLabel={t("stock.list.sort.open")}
                  name="sort"
                  onPress={vm.onOpenSort}
                />
              ) : null}
              <IconButton
                accessibilityLabel={t("stock.list.add")}
                name="plus"
                onPress={vm.onAddPress}
                testID="stock-add"
              />
            </>
          }
          subtitle={subtitle}
          title={t("stock.list.title")}
        />
        {hasContent ? (
          <>
            <SearchField
              clearLabel={t("common.actions.clear")}
              onChangeText={vm.onSearchChange}
              placeholder={t("stock.list.search")}
              value={vm.search}
            />
            <ChipGroup
              layout="scroll"
              mode="single"
              onChange={vm.onFilterChange}
              options={vm.filterOptions.map((option) => ({
                count: option.count,
                label: option.labelKey
                  ? t(option.labelKey)
                  : (option.label ?? ""),
                value: option.value,
              }))}
              testID="stock-filter"
              value={vm.activeFilter}
            />
          </>
        ) : null}
      </View>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        onClose={vm.onCloseSort}
        title={t("stock.list.sort.title")}
        visible={vm.isSortOpen}
      >
        {vm.sortOptions.map((option) => (
          <ListItem
            key={option.value}
            onPress={() => vm.onSortChange(option.value)}
            testID={`stock-sort-${option.value}`}
            title={t(option.labelKey)}
            trailing={
              vm.sort === option.value ? (
                <View testID={`stock-sort-${option.value}-selected`}>
                  <IconTile name="check" tone="accent" />
                </View>
              ) : undefined
            }
          />
        ))}
      </BottomSheet>
      {vm.selectedItem ? (
        <StockItemDetails
          item={vm.selectedItem}
          onClose={vm.onCloseDetails}
          onDeleted={vm.onItemDeleted}
        />
      ) : null}
    </Screen>
  );
}

export default Stock;
