import { View } from "react-native";

import {
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";

import { useStockItemDetailsViewModel } from "./hooks";
import { Props } from "./hooks/useStockItemDetailsViewModel";
import { DetailsTile, QuantityText } from "./models/StockItemDetailsUIModel";
import useStyles from "./styles";
import stockItemDetailsTestIds from "./testIds";

function StockItemDetails(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useStockItemDetailsViewModel(props);
  const { model } = vm;

  function quantityText(quantity: QuantityText) {
    return `${quantity.text} ${t(quantity.unitKey)}`;
  }

  function tileValue(tile: DetailsTile) {
    if ("quantities" in tile.value) {
      return tile.value.quantities.map(quantityText).join(" · ");
    }

    return t(tile.value.key as TranslationKeys, tile.value.params);
  }

  function renderLots() {
    if (!model) {
      return null;
    }

    if (model.lots.length === 0) {
      return <Text.Caption value={t("stock.lots.empty")} />;
    }

    return model.lots.map((lot) => (
      <Card key={lot.id} testID={stockItemDetailsTestIds.lot}>
        <View style={styles.lotRow}>
          <View style={styles.lotInfo}>
            <View style={styles.inline}>
              <Text.BodyStrong value={quantityText(lot.quantity)} />
              {lot.badges.map((badge) => (
                <Badge
                  key={badge.labelKey}
                  label={t(badge.labelKey, badge.params)}
                  tone={badge.tone}
                />
              ))}
            </View>
            <Text.Caption value={t(lot.subtitle.key, lot.subtitle.params)} />
          </View>
          {lot.canDiscard ? (
            <Button.Destructive
              label={t("stock.lots.discard")}
              onPress={() => vm.onDiscard(lot.id)}
              testID={stockItemDetailsTestIds.discardButton}
            />
          ) : null}
        </View>
      </Card>
    ));
  }

  function renderHistory() {
    if (vm.isHistoryLoading) {
      return <Skeleton.ListItem />;
    }

    if (vm.history.length === 0) {
      return <Text.Caption value={t("stock.history.empty")} />;
    }

    return vm.history.map((row) => (
      <View
        key={row.id}
        style={styles.historyRow}
        testID={stockItemDetailsTestIds.historyRow}
      >
        <Text.Caption value={row.createdAt} />
        <View style={styles.historyInfo}>
          <Text.BodyStrong value={t(row.titleKey)} />
          <Text.Caption
            value={[
              row.reasonKey ? t(row.reasonKey) : undefined,
              row.user ?? t("stock.history.formerMember"),
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        </View>
        <Text.Body
          tone={row.isPositive ? "income" : "primary"}
          value={`${row.quantity.sign} ${quantityText(row.quantity)}`.trim()}
        />
      </View>
    ));
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Destructive
          fullWidth
          label={t("stock.details.delete")}
          onPress={vm.onDeletePress}
          size="lg"
          testID={stockItemDetailsTestIds.deleteButton}
        />
      }
      onClose={props.onClose}
      size="form"
      subtitle={model?.headerLine}
      testID={stockItemDetailsTestIds.sheet}
      title={props.item.description}
      visible={vm.isFocused}
    >
      {vm.isLoading ? <Skeleton.ListItem /> : null}
      {vm.loadErrorKey ? (
        <ErrorState
          message={t(vm.loadErrorKey)}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
      ) : null}
      {model ? (
        <View style={styles.content}>
          <View style={styles.actions}>
            <Button.Secondary
              label={t("stock.details.edit")}
              onPress={vm.onEdit}
              testID={stockItemDetailsTestIds.editButton}
            />
            {vm.canAddToList ? (
              <Button.Secondary
                label={t("stock.lists.addToList")}
                onPress={vm.onAddToList}
                testID={stockItemDetailsTestIds.addToListButton}
              />
            ) : null}
            <Button.Secondary
              label={t("stock.details.open")}
              onPress={vm.onOpen}
              testID={stockItemDetailsTestIds.openButton}
            />
            <Button.Secondary
              label={t("stock.details.consume")}
              onPress={vm.onConsume}
              testID={stockItemDetailsTestIds.consumeButton}
            />
            <Button.Primary
              label={t("stock.details.entry")}
              onPress={vm.onEntry}
              testID={stockItemDetailsTestIds.entryButton}
            />
          </View>
          <View style={styles.tiles}>
            {model.tiles.map((tile) => (
              <Card
                key={tile.key}
                testID={`${stockItemDetailsTestIds.tile}-${tile.key}`}
              >
                <Text.Caption value={t(tile.labelKey)} />
                <Text.Heading value={tileValue(tile)} />
              </Card>
            ))}
          </View>
          {model.restock ? (
            <Badge
              label={t("stock.details.restock", {
                quantity: quantityText(model.restock),
              })}
              tone="accent"
            />
          ) : null}
          <FormColumns
            left={
              <>
                <Text.Heading value={t("stock.lots.title")} />
                <Text.Caption value={t("stock.lots.hint")} />
                {renderLots()}
              </>
            }
            right={
              <>
                <Text.Heading value={t("stock.history.title")} />
                <Text.Caption value={t("stock.history.hint")} />
                {renderHistory()}
                {vm.hasMore ? (
                  <Button.Secondary
                    label={t("stock.history.loadMore")}
                    loading={vm.isLoadingMore}
                    onPress={vm.onLoadMore}
                    testID={stockItemDetailsTestIds.loadMore}
                  />
                ) : null}
              </>
            }
            testID={stockItemDetailsTestIds.columns}
          />
        </View>
      ) : null}
      {vm.errorKey ? (
        <ErrorState
          message={t(vm.errorKey)}
          onRetry={vm.onConfirmDelete}
          retryLabel={t("common.actions.tryAgain")}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("stock.details.delete")}
        loading={vm.isDeleting}
        message={t("stock.details.deleteMessage")}
        onCancel={vm.onCancelDelete}
        onConfirm={vm.onConfirmDelete}
        testID={stockItemDetailsTestIds.deleteDialog}
        title={t("stock.details.deleteTitle", { name: props.item.description })}
        visible={vm.isConfirmOpen}
      />
    </BottomSheet>
  );
}

export default StockItemDetails;
