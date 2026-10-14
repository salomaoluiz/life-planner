import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  ChipGroup,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  IconTile,
  SegmentedControl,
  TreeItem,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useCategoriesViewModel } from "./hooks";
import CategoryRowUIModel from "./models/CategoryRowUIModel";
import useStyles from "./styles";
import categoriesTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialCategories() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { sizes } = useKitTheme();
  const vm = useCategoriesViewModel();

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
        <IconButton
          accessibilityLabel={t("financial.categories.new")}
          name={"plus"}
          onPress={vm.onAddPress}
          testID={categoriesTestIds.addButton}
        />
      </View>
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onOwnerFilterChange}
        options={translateChoices(vm.ownerChoices, t)}
        value={vm.ownerFilter}
      />
    </View>
  );

  function renderItem({
    index,
    item,
  }: {
    index: number;
    item: CategoryRowUIModel;
  }) {
    const rowTestID =
      item.depth > 0 ? categoriesTestIds.childRow : categoriesTestIds.row;
    let subtitle: string | undefined;
    if (item.subcount > 0) {
      subtitle = t(pluralKey("financial.categories.subcount", item.subcount), {
        count: item.subcount,
      });
    }

    return (
      <TreeItem
        depth={item.depth}
        divider={index < vm.rows.length - 1}
        leading={<IconTile color={item.color} name={item.icon} />}
        onPress={() => vm.onRowPress(item.id)}
        subtitle={subtitle}
        testID={rowTestID}
        title={item.name}
        trailing={
          item.hasChildren ? (
            <Icon
              name={"chevron-down"}
              size={sizes.iconMd}
              testID={"category-row-chevron"}
            />
          ) : undefined
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
        data={vm.rows}
        estimatedItemSize={64}
        keyExtractor={(row) => row.id}
        ListEmptyComponent={
          <EmptyState
            actionLabel={t("financial.categories.new")}
            message={t("financial.categories.emptyMessage")}
            onAction={vm.onAddPress}
            testID={categoriesTestIds.emptyState}
            title={t(vm.emptyTitleKey)}
          />
        }
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
      />
    </View>
  );
}

export default FinancialCategories;
