import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  Badge,
  ChipGroup,
  EmptyState,
  ErrorState,
  IconButton,
  ListItem,
  ReadOnlyNotice,
  Toast,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useTagsViewModel } from "./hooks";
import { TagRow } from "./models/tagRows";
import useStyles from "./styles";
import tagsTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialTags() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useTagsViewModel();

  const ownerChoices = translateChoices(vm.ownerChoices, t);
  const ownerLabels = new Map(
    ownerChoices.map((choice) => [choice.value, choice.label]),
  );

  const toolbar = (
    <View style={styles.toolbar} testID="tags-toolbar">
      <View style={styles.topRow}>
        <ChipGroup
          layout={"scroll"}
          mode={"single"}
          onChange={vm.onOwnerFilterChange}
          options={ownerChoices}
          testID={tagsTestIds.ownerFilter}
          value={vm.ownerFilter}
        />
        {vm.readOnly ? null : (
          <IconButton
            accessibilityLabel={t("financial.tags.new")}
            name={"plus"}
            onPress={vm.onAddPress}
            testID={tagsTestIds.addButton}
          />
        )}
      </View>
      {vm.readOnly ? (
        <ReadOnlyNotice
          message={t("family.archived.banner")}
          testID={tagsTestIds.readOnlyBanner}
        />
      ) : null}
    </View>
  );

  function renderItem({ item }: { item: TagRow }) {
    const ownerLabel = ownerLabels.get(item.ownerId);
    const scopeBadge = item.isAll ? (
      <Badge
        label={t("financial.tags.all")}
        testID={tagsTestIds.scopeAll}
        tone={"accent"}
      />
    ) : (
      ownerLabel && <Badge label={ownerLabel} testID={tagsTestIds.ownerBadge} />
    );

    return (
      <ListItem
        divider
        onPress={() => vm.onRowPress(item.id)}
        subtitle={
          item.usageCount === 0
            ? t("financial.tags.unused")
            : t(pluralKey("financial.tags.usage", item.usageCount), {
                count: item.usageCount,
              })
        }
        testID={`${tagsTestIds.row}-${item.id}`}
        title={item.name}
        trailing={scopeBadge}
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
      <View style={styles.root} testID={tagsTestIds.screen}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"tags-skeleton"} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root} testID={tagsTestIds.screen}>
      <FlashList
        data={vm.rows}
        estimatedItemSize={64}
        keyExtractor={(row) => row.id}
        ListEmptyComponent={
          <EmptyState
            actionLabel={vm.readOnly ? undefined : t("financial.tags.new")}
            message={t("financial.tags.empty")}
            onAction={vm.readOnly ? undefined : vm.onAddPress}
            testID={tagsTestIds.emptyState}
            title={t("financial.tags.title")}
          />
        }
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        testID={tagsTestIds.list}
      />
      <Toast
        icon={"lock-outline"}
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        testID={tagsTestIds.readOnlyToast}
        visible={vm.toastVisible}
      />
    </View>
  );
}

export default FinancialTags;
