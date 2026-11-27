import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  FormColumns,
  ListItem,
  MetricBlock,
  SearchField,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";

import { BatchVM } from "../hooks";
import batchTestIds from "../testIds";

// Spec 127 section 8: two columns on web and tablet (summary on the left, search and items on the right), one stack on
// mobile (the same sheet, which turns into a bottom sheet).
function Wide({ vm }: AdaptiveViewProps<BatchVM>) {
  const { t } = useTranslation();
  const header = vm.header;

  const summary = (
    <View>
      <Text.Title value={vm.title} />
      <Text.Caption tone="secondary" value={vm.when} />
      {header ? (
        <View>
          <MetricBlock
            label={t("activity.batch.title")}
            value={String(header.count)}
          />
          <MetricBlock
            label={t("activity.batch.existing")}
            testID={batchTestIds.existing}
            value={String(header.existing)}
          />
          {vm.owner ? (
            <Text.Caption value={`${t("activity.batch.owner")}: ${vm.owner}`} />
          ) : null}
          {vm.file ? (
            <Text.Caption value={`${t("activity.batch.file")}: ${vm.file}`} />
          ) : null}
          {header.sources ? (
            <Text.Caption
              value={`${t("activity.batch.sources")}: ${header.sources}`}
            />
          ) : null}
          {header.dates ? (
            <Text.Caption
              value={`${t("activity.batch.dates")}: ${header.dates}`}
            />
          ) : null}
          {header.total ? (
            <Text.Caption
              value={`${t("activity.batch.total")}: ${header.total}`}
            />
          ) : null}
        </View>
      ) : null}
      <Text.Caption tone="secondary" value={t("activity.batch.note")} />
    </View>
  );

  const list = (
    <View testID={batchTestIds.list}>
      <SearchField
        clearLabel={t("common.actions.clear")}
        onChangeText={vm.onSearchChange}
        placeholder={t("activity.batch.search")}
        testID={batchTestIds.search}
        value={vm.search}
      />
      {vm.isLoading
        ? [0, 1, 2, 3].map((row) => <Skeleton.ListItem key={row} />)
        : vm.rows.map((row, index) => (
            <ListItem
              divider
              key={row.key}
              subtitle={row.meta}
              testID={`${batchTestIds.item}-${index}`}
              title={row.label}
              trailing={
                <View>
                  <Text.Caption value={row.amount} />
                  {row.canOpen ? (
                    <Button.Ghost
                      inline
                      label={t("activity.open")}
                      onPress={() => vm.onOpen(index)}
                      testID={`${batchTestIds.open}-${index}`}
                    />
                  ) : (
                    <Text.Caption
                      tone="secondary"
                      value={t("activity.itemDeleted")}
                    />
                  )}
                </View>
              }
            />
          ))}
      {vm.hasNext ? (
        <Button.Secondary
          label={t("activity.loadMore")}
          loading={vm.isLoadingMore}
          onPress={vm.onLoadMore}
          testID={batchTestIds.loadMore}
        />
      ) : null}
    </View>
  );

  return (
    <BottomSheet
      closeLabel={t("activity.batch.close")}
      onClose={vm.onClose}
      paneScroll
      size={"form"}
      testID={batchTestIds.sheet}
      title={vm.title}
      visible
    >
      <FormColumns left={summary} right={list} testID={batchTestIds.sheet} />
    </BottomSheet>
  );
}

export default Wide;
