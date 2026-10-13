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
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useCategoriesViewModel } from "./hooks";
import CategoryRowUIModel from "./models/CategoryRowUIModel";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialCategories() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { sizes } = useKitTheme();
  const vm = useCategoriesViewModel();

  const toolbar = (
    <View style={styles.toolbar}>
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
            value={vm.type}
          />
        </View>
        <IconButton
          accessibilityLabel={t("financial.categories.new")}
          name={"plus"}
          onPress={vm.onAddPress}
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

  function renderItem({ item }: { item: CategoryRowUIModel }) {
    let subtitle: string | undefined;
    if (item.subcount > 0) {
      subtitle = t("financial.categories.subcount", { count: item.subcount });
    }

    return (
      <TreeItem
        depth={item.depth}
        leading={<IconTile color={item.color} name={item.icon} />}
        onPress={() => vm.onRowPress(item.id)}
        subtitle={subtitle}
        testID={`category-row-${item.id}`}
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
      <View style={styles.root}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"categories-skeleton"} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={vm.rows}
        estimatedItemSize={64}
        keyExtractor={(row) => row.id}
        ListEmptyComponent={
          <EmptyState
            actionLabel={t("financial.categories.new")}
            message={t("financial.categories.emptyMessage")}
            onAction={vm.onAddPress}
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
