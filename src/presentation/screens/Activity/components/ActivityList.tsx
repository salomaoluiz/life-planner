import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  Badge,
  Button,
  EmptyState,
  IconTile,
  ListItem,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";

import { ActivityVM } from "../hooks";
import { ActivityRowUI } from "../models/activityRows";
import useStyles from "../styles";
import activityTestIds from "../testIds";

type Item =
  | { key: string; label: string; type: "header" }
  | { key: string; row: ActivityRowUI; type: "row" };

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

interface Props {
  header: React.ReactNode;
  vm: ActivityVM;
}

// Rows grouped by the day of the action (spec 127 section 8): who, what, meta, before → after, time, owner and the
// way to open the item ("Abrir", "Ver itens" or "Item apagado").
function ActivityList({ header, vm }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const items: Item[] = vm.days.flatMap((day) => [
    { key: `day-${day.key}`, label: day.label, type: "header" as const },
    ...day.rows.map((row) => ({ key: row.id, row, type: "row" as const })),
  ]);

  function pressOf(row: ActivityRowUI) {
    if (row.isBatch) {
      return () => vm.onViewItems(row);
    }

    return row.target ? () => vm.onOpen(row) : undefined;
  }

  function renderRow(row: ActivityRowUI) {
    const openable = row.target !== null;
    const press = pressOf(row);

    return (
      <ListItem
        accessibilityLabel={`${row.who} ${row.verb} ${row.label}`}
        divider
        leading={<IconTile name={row.icon} tone={row.tone} />}
        meta={
          <View style={styles.meta}>
            <Text.Caption
              tone={row.metaWarning ? "warning" : "secondary"}
              value={row.meta}
            />
            {row.diffs.map((diff) => (
              <View key={diff.field} style={styles.diff}>
                <Text.Caption tone="secondary" value={`${diff.field}:`} />
                <Text.Caption strikethrough tone="expense" value={diff.from} />
                <Text.Caption value="→" />
                <Text.Caption bold tone="income" value={diff.to} />
              </View>
            ))}
          </View>
        }
        onPress={press}
        testID={`${activityTestIds.row}-${row.id}`}
        title={`${row.who} ${row.verb} ${row.label}`.trim()}
        trailing={
          <View style={styles.trailing}>
            <Text.Caption tone="secondary" value={row.time} />
            {row.ownerLabel ? (
              <Badge label={row.ownerLabel} tone="accent" />
            ) : null}
            {row.isBatch ? (
              <Button.Ghost
                inline
                label={t("activity.viewItems")}
                onPress={() => vm.onViewItems(row)}
                testID={`${activityTestIds.viewItems}-${row.id}`}
              />
            ) : null}
            {!row.isBatch && openable ? (
              <Button.Ghost
                accessibilityLabel={t("activity.openA11y", {
                  label: row.label,
                })}
                inline
                label={t("activity.open")}
                onPress={() => vm.onOpen(row)}
                testID={`${activityTestIds.open}-${row.id}`}
              />
            ) : null}
            {row.gone ? (
              <Text.Caption
                tone="secondary"
                value={t("activity.itemDeleted")}
              />
            ) : null}
          </View>
        }
      />
    );
  }

  if (vm.errorKey) {
    return (
      <View style={styles.root}>
        {header}
        <EmptyState
          actionLabel={t("common.actions.tryAgain")}
          message={t(vm.errorKey)}
          onAction={vm.onRetry}
          title={t("activity.title")}
        />
      </View>
    );
  }

  if (vm.isLoading) {
    return (
      <View style={styles.root} testID={activityTestIds.screen}>
        {header}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"activity-skeleton"} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root} testID={activityTestIds.screen}>
      <FlashList
        data={items}
        estimatedItemSize={72}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={
          <EmptyState
            actionLabel={t("activity.empty.clear")}
            icon={"history"}
            message={t("activity.empty.body")}
            onAction={vm.onClearFilters}
            testID={activityTestIds.emptyState}
            title={t("activity.empty.title")}
          />
        }
        ListFooterComponent={
          vm.hasNext ? (
            <View style={styles.center}>
              <Button.Secondary
                label={t("activity.loadMore")}
                loading={vm.isLoadingMore}
                onPress={vm.onLoadMore}
                testID={activityTestIds.loadMore}
              />
            </View>
          ) : null
        }
        ListHeaderComponent={<>{header}</>}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <View style={styles.dayHeader}>
              <Text.Overline tone="secondary" value={item.label} />
            </View>
          ) : (
            renderRow(item.row)
          )
        }
        showsVerticalScrollIndicator={false}
        testID={activityTestIds.list}
      />
    </View>
  );
}

export default ActivityList;
