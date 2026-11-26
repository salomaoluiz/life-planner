import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  Button,
  ChipGroup,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  IconTile,
  ListItem,
  ReadOnlyNotice,
  SegmentedControl,
  Text,
  Toast,
  TreeItem,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import {
  CATEGORY_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
} from "@presentation/constants/stockCatalogAppearance";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import SectionHeader from "@screens/Stock/Layout/components/SectionHeader";

import CatalogDelete from "../components/CatalogDelete";
import CatalogEmptyOwner from "../components/CatalogEmptyOwner";
import CatalogForm from "../components/CatalogForm";
import LocationQrPrintSheet from "../components/LocationQrPrintSheet";
import { StockCatalogScreenVM } from "../hooks";
import { CatalogEntry } from "../models/catalogEntries";
import stockCatalogTestIds from "../testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function Wide({ vm }: AdaptiveViewProps<StockCatalogScreenVM>) {
  const { t } = useTranslation();
  const { sizes, spacing } = useKitTheme();
  const isCategories = vm.tab === "categories";
  const ownerChoices = translateChoices(vm.ownerChoices, t);
  const ownerLabels = new Map(
    ownerChoices.map((choice) => [choice.value, choice.label]),
  );

  const toolbar = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
      <View
        style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}
      >
        <View style={{ flex: 1 }}>
          <SegmentedControl
            accessibilityLabel={t("stock.catalog.title")}
            onChange={vm.onTabChange}
            options={[
              {
                label: t("stock.catalog.tabs.categories"),
                value: "categories",
              },
              { label: t("stock.catalog.tabs.locations"), value: "locations" },
            ]}
            testID={stockCatalogTestIds.tabs}
            value={vm.tab}
          />
        </View>
        {isCategories ? null : (
          <Button.Secondary
            label={t("stock.catalog.printQrs")}
            onPress={vm.onPrintOpen}
            testID={stockCatalogTestIds.printButton}
          />
        )}
        {vm.readOnly ? null : (
          <IconButton
            accessibilityLabel={t(
              isCategories
                ? "stock.catalog.add.category"
                : "stock.catalog.add.location",
            )}
            name={"plus"}
            onPress={vm.onAddPress}
            testID={stockCatalogTestIds.addButton}
          />
        )}
      </View>
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onOwnerFilterChange}
        options={ownerChoices}
        testID={stockCatalogTestIds.ownerFilter}
        value={vm.ownerFilter}
      />
      {vm.readOnly ? (
        <ReadOnlyNotice
          message={t("family.archived.banner")}
          testID={stockCatalogTestIds.readOnlyBanner}
        />
      ) : null}
    </View>
  );

  function renderItem({ item: entry }: { item: CatalogEntry }) {
    if (entry.kind === "archivedToggle") {
      return (
        <ListItem
          inset
          onPress={vm.onArchivedToggle}
          testID={stockCatalogTestIds.archivedToggle}
          title={t(
            isCategories
              ? "stock.catalog.archivedCategories"
              : "stock.catalog.archivedLocations",
            { count: entry.count },
          )}
          trailing={
            <Icon
              name={entry.expanded ? "chevron-up" : "chevron-down"}
              size={sizes.iconMd}
            />
          }
        />
      );
    }

    const { row } = entry;
    const node = row.node;
    const subtitle =
      row.subcount > 0
        ? t(
            pluralKey(
              isCategories
                ? "stock.catalog.subcategories"
                : "stock.catalog.sublocations",
              row.subcount,
            ),
            { count: row.subcount },
          )
        : undefined;
    const finance = node.financeCategoryId
      ? vm.financeLabels.get(node.financeCategoryId)
      : undefined;
    const ownerLabel = ownerLabels.get(node.ownerId);

    return (
      <TreeItem
        depth={row.depth}
        divider={!entry.isLast}
        leading={
          row.isArchived ? (
            <IconTile name={node.icon} tone={"neutral"} />
          ) : (
            <IconTile color={node.color} name={node.icon} />
          )
        }
        onPress={() => vm.onRowPress(node.id)}
        subtitle={
          [
            subtitle,
            finance
              ? t("stock.catalog.financeCaption", { name: finance })
              : undefined,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        testID={`${stockCatalogTestIds.row}.${node.id}`}
        title={node.name}
        trailing={
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            <Text.Caption
              tone={"secondary"}
              value={t(pluralKey("stock.catalog.itemCount", node.itemCount), {
                count: node.itemCount,
              })}
            />
            {vm.ownerFilter === "ALL" && ownerLabel ? (
              <Badge
                label={ownerLabel}
                testID={stockCatalogTestIds.ownerBadge}
              />
            ) : null}
            {row.hasChildren ? (
              <Icon name={"chevron-down"} size={sizes.iconMd} />
            ) : null}
          </View>
        }
      />
    );
  }

  if (vm.errorMessage) {
    return (
      <ErrorState
        message={vm.errorMessage}
        onRetry={vm.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={stockCatalogTestIds.errorState}
      />
    );
  }

  const header = <SectionHeader section="catalog" />;

  if (vm.isLoading) {
    return (
      <View style={{ flex: 1 }} testID={stockCatalogTestIds.screen}>
        {header}
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"stock-catalog-skeleton"} />
        ))}
      </View>
    );
  }

  const suggestions = isCategories
    ? CATEGORY_SUGGESTIONS
    : LOCATION_SUGGESTIONS;
  const kind = isCategories ? "category" : "location";
  const empties = vm.emptyOwners.map((owner) => (
    <CatalogEmptyOwner
      busy={vm.isBusy}
      key={owner.id}
      kind={kind}
      onCreate={(keys) => vm.onCreateSuggestions(owner.id, owner.kind, keys)}
      onFromScratch={() => vm.onFromScratch(owner.id)}
      onToggle={(key) => vm.onToggleSuggestion(owner.id, key)}
      ownerName={owner.name}
      readOnly={vm.readOnly}
      suggestions={suggestions}
      unchecked={vm.unchecked[owner.id] ?? []}
    />
  ));

  return (
    <View style={{ flex: 1 }} testID={stockCatalogTestIds.screen}>
      <FlashList
        data={vm.entries}
        estimatedItemSize={64}
        keyExtractor={(entry) => entry.key}
        ListEmptyComponent={
          vm.emptyOwners.length === 0 ? (
            <EmptyState
              message={t("stock.catalog.empty.hint")}
              testID={stockCatalogTestIds.empty}
              title={t("stock.catalog.title")}
            />
          ) : null
        }
        ListFooterComponent={<View>{empties}</View>}
        ListHeaderComponent={
          <View>
            {header}
            {toolbar}
          </View>
        }
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      {vm.editor && vm.data ? (
        <CatalogForm
          categories={vm.data.categories}
          id={vm.editor.id}
          key={`${vm.editor.kind}-${vm.editor.id ?? "new"}-${vm.editor.parentId ?? ""}`}
          kind={vm.editor.kind}
          locations={vm.data.locations}
          onAddChild={vm.onAddChild}
          onClose={vm.onEditorClose}
          onDelete={(id) =>
            vm.onDeleteRequest(id, vm.editor?.kind ?? "category")
          }
          onSaved={vm.onSaved}
          onViewItems={(id) =>
            vm.onViewItems(id, vm.editor?.kind ?? "category")
          }
          ownerId={vm.editor.ownerId}
          ownerKind={vm.editor.ownerKind}
          parentId={vm.editor.parentId}
        />
      ) : null}
      {vm.deleting && vm.data ? (
        <CatalogDelete
          categories={vm.data.categories}
          id={vm.deleting.id}
          kind={vm.deleting.kind}
          locations={vm.data.locations}
          onClose={vm.onDeleteClose}
          onDeleted={vm.onDeleted}
        />
      ) : null}
      {vm.printOpen ? (
        <LocationQrPrintSheet
          locations={vm.printLocations.map(({ node, path }) => ({
            id: node.id,
            path,
          }))}
          onClose={vm.onPrintClose}
        />
      ) : null}
      <Toast
        icon={"lock-outline"}
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        testID={stockCatalogTestIds.readOnlyToast}
        visible={vm.toastVisible}
      />
    </View>
  );
}

export default Wide;
