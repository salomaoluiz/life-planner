import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  Badge,
  ChipGroup,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  IconTile,
  ListItem,
  ReadOnlyNotice,
  SegmentedControl,
  Toast,
  TreeItem,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useCategoriesViewModel } from "./hooks";
import { CategoryEntry } from "./models/categoryEntries";
import useStyles from "./styles";
import categoriesTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialCategories() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { sizes } = useKitTheme();
  const vm = useCategoriesViewModel();

  const ownerChoices = translateChoices(vm.ownerChoices, t);
  const ownerLabels = new Map(
    ownerChoices.map((choice) => [choice.value, choice.label]),
  );

  const toolbar = (
    <View style={styles.toolbar} testID="categories-toolbar">
      <View style={styles.typeRow}>
        <View style={styles.typeControl}>
          <SegmentedControl
            accessibilityLabel={t("financial.categories.form.type")}
            onChange={vm.onTypeChange}
            options={vm.typeOptions.map((option) => ({
              label: t(option.labelKey),
              tone: option.value === "EXPENSE" ? "expense" : "income",
              value: option.value,
            }))}
            testID={categoriesTestIds.type}
            value={vm.type}
          />
        </View>
        {vm.readOnly ? null : (
          <IconButton
            accessibilityLabel={t("financial.categories.new")}
            name={"plus"}
            onPress={vm.onAddPress}
            testID={categoriesTestIds.addButton}
          />
        )}
      </View>
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onOwnerFilterChange}
        options={ownerChoices}
        testID={categoriesTestIds.ownerFilter}
        value={vm.ownerFilter}
      />
      {vm.readOnly ? (
        <ReadOnlyNotice
          message={t("family.archived.banner")}
          testID={categoriesTestIds.readOnlyBanner}
        />
      ) : null}
    </View>
  );

  function renderItem({ item: entry }: { item: CategoryEntry }) {
    if (entry.kind === "archivedToggle") {
      return (
        <ListItem
          inset
          onPress={vm.onArchivedToggle}
          testID={categoriesTestIds.archivedToggle}
          title={t("financial.categories.archived", { count: entry.count })}
          trailing={
            <Icon
              name={entry.expanded ? "chevron-up" : "chevron-down"}
              size={sizes.iconMd}
            />
          }
        />
      );
    }

    const { row: item } = entry;
    const rowTestID =
      item.depth > 0 ? categoriesTestIds.childRow : categoriesTestIds.row;
    let subtitle: string | undefined;
    if (item.subcount > 0) {
      subtitle = t(pluralKey("financial.categories.subcount", item.subcount), {
        count: item.subcount,
      });
    }

    // Spec 038: an All category shows one "All" marker, any other row its owner.
    const ownerLabel = ownerLabels.get(item.ownerId);
    const scopeBadge = item.isAll ? (
      <Badge
        label={t("financial.categories.scopeAll")}
        testID={categoriesTestIds.scopeAll}
        tone={"accent"}
      />
    ) : (
      ownerLabel && (
        <Badge label={ownerLabel} testID={categoriesTestIds.ownerBadge} />
      )
    );

    return (
      <TreeItem
        depth={item.depth}
        divider={!entry.isLast}
        leading={
          item.isArchived ? (
            <IconTile name={item.icon} tone={"neutral"} />
          ) : (
            <IconTile color={item.color} name={item.icon} />
          )
        }
        onPress={() => vm.onRowPress(item.id)}
        subtitle={subtitle}
        testID={rowTestID}
        title={item.name}
        trailing={
          <View style={styles.trailing}>
            {scopeBadge}
            {item.hasChildren && (
              <Icon
                name={"chevron-down"}
                size={sizes.iconMd}
                testID={"category-row-chevron"}
              />
            )}
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
      />
    );
  }

  if (vm.isLoading) {
    return (
      <View style={styles.root} testID={categoriesTestIds.screen}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"categories-skeleton"} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root} testID={categoriesTestIds.screen}>
      <FlashList
        data={vm.entries}
        estimatedItemSize={64}
        keyExtractor={(entry) => entry.key}
        ListEmptyComponent={
          <EmptyState
            actionLabel={
              vm.readOnly ? undefined : t("financial.categories.new")
            }
            message={t("financial.categories.emptyMessage")}
            onAction={vm.readOnly ? undefined : vm.onAddPress}
            testID={categoriesTestIds.emptyState}
            title={t(vm.emptyTitleKey)}
          />
        }
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <Toast
        icon={"lock-outline"}
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        testID={categoriesTestIds.readOnlyToast}
        visible={vm.toastVisible}
      />
    </View>
  );
}

export default FinancialCategories;
