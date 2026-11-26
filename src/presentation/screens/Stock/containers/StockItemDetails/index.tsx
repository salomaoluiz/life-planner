import { View } from "react-native";

import {
  Badge,
  BottomSheet,
  Button,
  Callout,
  Card,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  Text,
  WeekBars,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";

import { useStockItemDetailsViewModel } from "./hooks";
import { Props } from "./hooks/useStockItemDetailsViewModel";
import {
  DaysText,
  DetailsTile,
  QuantityText,
} from "./models/StockItemDetailsUIModel";
import useStyles from "./styles";
import stockItemDetailsTestIds from "./testIds";

// A lot that will expire before it is used is tinted (spec 123 FR 24); the text says it too ("sobra ~1 un").
function LotTint(props: { children: React.ReactNode; tinted: boolean }) {
  return props.tinted ? (
    <Callout tone="expense">{props.children}</Callout>
  ) : (
    <>{props.children}</>
  );
}

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

  function daysLabel(days: DaysText) {
    return t(days.key, days.params);
  }

  // Spec 123 FR 19: weekly use, when it reaches the minimum, when it runs out, the 12-week chart and the forecast row.
  function renderForecast() {
    const forecast = model?.forecast;

    if (!model || !forecast) {
      return null;
    }

    if (forecast.kind !== "ok") {
      return (
        <Card testID={stockItemDetailsTestIds.forecast}>
          <Text.Heading value={t("stock.forecast.title")} />
          <Text.Caption
            value={t(
              forecast.kind === "insufficient"
                ? "stock.forecast.insufficient"
                : "stock.forecast.noConsumption",
            )}
          />
        </Card>
      );
    }

    return (
      <Card testID={stockItemDetailsTestIds.forecast}>
        <Text.Heading value={t("stock.forecast.title")} />
        <View style={styles.figures}>
          <View style={styles.figure}>
            <Text.Caption value={t("stock.forecast.tileAverage")} />
            <Text.Heading
              value={t("stock.forecast.perWeek", {
                quantity: quantityText(forecast.weekly),
              })}
            />
            <Text.Caption
              value={t("stock.forecast.perDay", {
                quantity: quantityText(forecast.perDay),
              })}
            />
          </View>
          <View style={styles.figure}>
            <Text.Caption
              value={
                forecast.min.limit
                  ? t("stock.forecast.reachesMin", {
                      min: quantityText(forecast.min.limit),
                    })
                  : t("stock.forecast.reachesMinNoMin")
              }
            />
            <Text.Heading value={daysLabel(forecast.min.days)} />
            <Text.Caption
              value={t("stock.forecast.onDate", { date: forecast.min.date })}
            />
          </View>
          <View style={styles.figure}>
            <Text.Caption value={t("stock.forecast.runsOut")} />
            <Text.Heading value={daysLabel(forecast.empty.days)} />
            <Text.Caption
              value={t("stock.forecast.onDate", { date: forecast.empty.date })}
            />
          </View>
        </View>
        {vm.chart ? (
          <View style={styles.row}>
            <Text.Caption value={t("stock.forecast.chartTitle")} />
            <WeekBars
              accessibilityLabel={t("stock.forecast.chartLabel", {
                values: vm.chart.values,
              })}
              bars={vm.chart.bars}
              testID={stockItemDetailsTestIds.chart}
            />
            <Text.Caption value={t("stock.forecast.chartHint")} />
          </View>
        ) : null}
        {model.forecastRow ? (
          <Callout testID={stockItemDetailsTestIds.forecastRow} tone="warning">
            <Text.BodyStrong
              value={t("stock.forecast.onList", {
                list: model.forecastRow.list,
                quantity: quantityText(model.forecastRow.quantity),
              })}
            />
            <Button.Secondary
              label={t("stock.forecast.viewList")}
              onPress={vm.onViewList}
              testID={stockItemDetailsTestIds.forecastViewList}
            />
          </Callout>
        ) : null}
      </Card>
    );
  }

  // Spec 123 FR 24: "Vai vencer antes de acabar" (role alert) with "Ver lote" and "Dispensar aviso".
  function renderLeftover() {
    const leftover = model?.leftover;

    if (!leftover) {
      return null;
    }

    return (
      <Callout
        role="alert"
        testID={stockItemDetailsTestIds.leftover}
        tone="expense"
      >
        <Text.BodyStrong value={t("stock.leftover.title")} />
        <Text.Body
          value={t("stock.leftover.body", {
            date: leftover.date,
            left: quantityText(leftover.left),
            quantity: quantityText(leftover.lotQuantity),
          })}
        />
        <View style={styles.actions}>
          <Button.Secondary
            label={t("stock.leftover.viewLot")}
            onPress={() => vm.onViewLot(leftover.lotId)}
            testID={stockItemDetailsTestIds.viewLotButton}
          />
          <Button.Secondary
            label={t("stock.leftover.dismiss")}
            loading={vm.isDismissing}
            onPress={() => vm.onDismissLeftover(leftover.lotId)}
            testID={stockItemDetailsTestIds.dismissButton}
          />
        </View>
      </Callout>
    );
  }

  // Spec 123 FR 32: the 90-day waste line and the link to the Waste screen.
  function renderWaste() {
    const waste = model?.waste;

    if (!waste) {
      return null;
    }

    return (
      <Card testID={stockItemDetailsTestIds.waste}>
        <Text.Heading value={t("stock.waste.title")} />
        <View style={styles.inline}>
          <Text.Body value={t("stock.waste.last90")} />
          <Text.BodyStrong
            value={[quantityText(waste.quantity), ...waste.values].join(" · ")}
          />
        </View>
        <Text.Caption
          value={t("stock.waste.last90Detail", {
            count: waste.count,
            reason: t(waste.reasonKey),
          })}
        />
        <Button.Secondary
          label={t("stock.waste.seeAll")}
          onPress={vm.onOpenWaste}
          testID={stockItemDetailsTestIds.wasteLink}
        />
      </Card>
    );
  }

  function renderLots() {
    if (!model) {
      return null;
    }

    if (model.lots.length === 0) {
      return <Text.Caption value={t("stock.lots.empty")} />;
    }

    return model.lots.map((lot) => (
      <Card
        key={lot.id}
        testID={
          lot.leftover || vm.highlightedLotId === lot.id
            ? stockItemDetailsTestIds.leftoverLot
            : stockItemDetailsTestIds.lot
        }
      >
        <LotTint tinted={!!lot.leftover || vm.highlightedLotId === lot.id}>
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
              <Text.Caption
                value={[
                  t(lot.subtitle.key, lot.subtitle.params),
                  lot.leftover
                    ? t("stock.leftover.lotLeft", {
                        quantity: quantityText(lot.leftover),
                      })
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </View>
            {lot.price ? (
              <Text.Caption
                value={t("stock.lots.pricePerUnit", {
                  price: lot.price.text,
                  unit: t(lot.price.unitKey),
                })}
              />
            ) : null}
            {lot.canDiscard ? (
              <Button.Destructive
                label={t("stock.lots.discard")}
                onPress={() => vm.onDiscard(lot.id)}
                testID={stockItemDetailsTestIds.discardButton}
              />
            ) : null}
          </View>
        </LotTint>
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
          {renderForecast()}
          {renderLeftover()}
          <FormColumns
            left={
              <>
                <Text.Heading value={t("stock.lots.title")} />
                <Text.Caption value={t("stock.lots.hint")} />
                {renderLots()}
                {renderWaste()}
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
