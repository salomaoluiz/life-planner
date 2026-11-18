import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  BottomSheet,
  Button,
  ChipGroup,
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  ListItem,
  ReadOnlyNotice,
  Screen,
  ScreenHeader,
  SearchField,
  Text,
  Toast,
} from "@components";
import Skeleton from "@components/Skeleton";
import { StockExpirationStatus } from "@domain/entities/stock/StockEntity";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import StockQuickOverlays, {
  OfflineBanner,
} from "@screens/Stock/components/StockQuickOverlays";
import StockQuickStepper from "@screens/Stock/components/StockQuickStepper";
import StockItemDetails from "@screens/Stock/containers/StockItemDetails";
import { StockListRow } from "@screens/Stock/models/StockListUIModel";

import { StockVM } from "../hooks";
import useStyles from "../styles";
import stockTestIds from "../testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function badgeTestId(labelKey: string) {
  const ids: Record<string, string> = {
    "stock.badge.expired": stockTestIds.statusExpired,
    "stock.badge.expiring": stockTestIds.statusExpiring,
    "stock.badge.opened": stockTestIds.statusOpened,
    "stock.badge.restock": stockTestIds.statusRestock,
  };

  return ids[labelKey];
}

function namesOf(options: Array<{ id: string; label: string }>, ids: string[]) {
  return options
    .filter((option) => ids.includes(option.id))
    .map((option) => option.label)
    .join(", ");
}

function Wide({ vm }: AdaptiveViewProps<StockVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  const hasContent = !vm.isLoading && !vm.errorMessageKey && !vm.isEmpty;
  let subtitle: string | undefined;
  if (hasContent) {
    subtitle = vm.subtitle.attention
      ? t(pluralKey("stock.list.subtitleAttention", vm.subtitle.total), {
          attention: vm.subtitle.attention,
          count: vm.subtitle.total,
        })
      : t(pluralKey("stock.list.subtitle", vm.subtitle.total), {
          count: vm.subtitle.total,
        });
  }

  function renderRow({ item: row }: { item: StockListRow }) {
    if (row.kind === "header") {
      return <Text.Overline value={t(row.titleKey)} />;
    }

    const { item } = row;
    const info = item.dateInfo;
    let date = "";

    if (info?.minimum) {
      date = t(info.key, {
        quantity: `${info.minimum.text} ${t(info.minimum.unitKey)}`,
      });
    } else if (info) {
      date = t(info.key, { date: info.date });
    } else if (item.status === StockExpirationStatus.NONE) {
      date = t("stock.list.date.noExpiration");
    }

    const quantity = `${item.quantity.text} ${t(item.quantity.unitKey)}`;
    const badgeLabels = item.badges.map((badge) => t(badge.labelKey));

    return (
      <ListItem
        accessibilityLabel={t("stock.list.rowA11y", {
          name: item.description,
          quantity,
          status: badgeLabels.join(", "),
        })}
        inset
        leading={
          <IconTile name={item.iconTile.icon} tone={item.iconTile.tone} />
        }
        meta={
          item.badges.length > 0 ? (
            <View style={styles.badges}>
              {item.badges.map((badge) => (
                <Badge
                  key={badge.labelKey}
                  label={t(badge.labelKey)}
                  testID={badgeTestId(badge.labelKey)}
                  tone={badge.tone}
                />
              ))}
            </View>
          ) : undefined
        }
        onPress={() => vm.onItemPress(item.id)}
        subtitle={[item.subtitle, date].filter(Boolean).join(" · ")}
        testID={stockTestIds.row}
        title={item.description}
        trailing={<StockQuickStepper item={item} quick={vm.quick} />}
      />
    );
  }

  function renderFilterSheet() {
    const isLocation = vm.openFilter === "location";
    const options = isLocation ? vm.locationOptions : vm.categoryOptions;

    if (options.length === 0) {
      return (
        <Text.Body
          value={t(
            isLocation
              ? "stock.list.filter.noLocations"
              : "stock.list.filter.noCategories",
          )}
        />
      );
    }

    return (
      <ChipGroup
        mode="multiple"
        onChange={isLocation ? vm.onLocationsChange : vm.onCategoriesChange}
        options={options.map((option) => ({
          label: option.label,
          value: option.id,
        }))}
        testID={stockTestIds.filterSheetOptions}
        value={isLocation ? vm.locationIds : vm.categoryIds}
      />
    );
  }

  function renderEmpty() {
    if (vm.isLoading) {
      return (
        <View testID={stockTestIds.skeleton}>
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
          actionLabel={vm.readOnly ? undefined : t("stock.list.add")}
          message={t("stock.list.emptyMessage")}
          onAction={vm.readOnly ? undefined : vm.onAddPress}
          testID={stockTestIds.emptyState}
          title={t("stock.list.emptyTitle")}
        />
      );
    }

    return (
      <View style={styles.noResults} testID={stockTestIds.noResults}>
        <Text.Body align="center" value={t("stock.list.noResults")} />
        <Button.Ghost
          label={t("stock.list.clearFilters")}
          onPress={vm.onClearFilters}
          testID={stockTestIds.clearFilters}
        />
      </View>
    );
  }

  return (
    <Screen
      list={
        <FlashList
          data={vm.rows}
          estimatedItemSize={64}
          getItemType={(row: StockListRow) => row.kind}
          keyExtractor={(row: StockListRow) => row.id}
          ListEmptyComponent={renderEmpty()}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
          testID="flashList"
        />
      }
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      testID={stockTestIds.screen}
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
                  testID={stockTestIds.sortButton}
                />
              ) : null}
              <Button.Secondary
                label={t("stock.catalog.open")}
                onPress={vm.onCatalogPress}
                testID={stockTestIds.catalogButton}
              />
              {vm.readOnly ? null : (
                <IconButton
                  accessibilityLabel={t("stock.list.add")}
                  name="plus"
                  onPress={vm.onAddPress}
                  testID={stockTestIds.addButton}
                />
              )}
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
              testID={stockTestIds.search}
              value={vm.search}
            />
            <ChipGroup
              layout="scroll"
              mode="single"
              onChange={vm.onFilterChange}
              options={vm.filterOptions.map((option) => ({
                count: option.count,
                icon: option.archived ? "archive-outline" : undefined,
                label: option.labelKey
                  ? t(option.labelKey)
                  : (option.label ?? ""),
                value: option.value,
              }))}
              testID={stockTestIds.filter}
              value={vm.activeFilter}
            />
            <View style={styles.catalogChips}>
              <Button.Secondary
                label={
                  vm.categoryIds.length
                    ? t("stock.list.filter.categoryValue", {
                        names: namesOf(vm.categoryOptions, vm.categoryIds),
                      })
                    : t("stock.list.filter.categories")
                }
                onPress={vm.onOpenCategorySheet}
                testID={stockTestIds.categoryFilter}
              />
              <Button.Secondary
                label={
                  vm.locationIds.length
                    ? t("stock.list.filter.locationValue", {
                        names: namesOf(vm.locationOptions, vm.locationIds),
                      })
                    : t("stock.list.filter.locations")
                }
                onPress={vm.onOpenLocationSheet}
                testID={stockTestIds.locationFilter}
              />
              <Text.Caption value={t("stock.list.filter.childrenHint")} />
            </View>
            <OfflineBanner quick={vm.quick} />
            {vm.readOnly ? (
              <ReadOnlyNotice
                message={t("family.archived.banner")}
                testID={stockTestIds.readOnlyBanner}
              />
            ) : null}
          </>
        ) : null}
      </View>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        onClose={vm.onCloseFilterSheet}
        testID={stockTestIds.filterSheet}
        title={
          vm.openFilter === "location"
            ? t("stock.list.filter.locations")
            : t("stock.list.filter.categories")
        }
        visible={vm.openFilter !== undefined}
      >
        {vm.isCatalogLoading ? <Skeleton.ListItem /> : renderFilterSheet()}
      </BottomSheet>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        onClose={vm.onCloseSort}
        title={t("stock.list.sort.title")}
        visible={vm.isSortOpen}
      >
        {vm.sortOptions.map((option) => (
          <ListItem
            inset
            key={option.value}
            onPress={() => vm.onSortChange(option.value)}
            testID={`${stockTestIds.sortOption}-${option.value}`}
            title={t(option.labelKey)}
            trailing={
              vm.sort === option.value ? (
                <View
                  testID={`${stockTestIds.sortOption}-${option.value}-selected`}
                >
                  <IconTile name="check" tone="accent" />
                </View>
              ) : undefined
            }
          />
        ))}
      </BottomSheet>
      <Toast
        icon={"lock-outline"}
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        testID={stockTestIds.readOnlyToast}
        visible={vm.toastVisible}
      />
      <StockQuickOverlays quick={vm.quick} />
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

export default Wide;
