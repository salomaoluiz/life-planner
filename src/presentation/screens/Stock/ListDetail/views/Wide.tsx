import { View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  AmountText,
  Badge,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  ReadOnlyNotice,
  Screen,
  StatusBanner,
  Text,
  TextField,
  Toast,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import AutocompleteField from "@components/AutocompleteField";
import Skeleton from "@components/Skeleton";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import QuantityField from "@screens/Stock/components/QuantityField";
import SectionHeader from "@screens/Stock/Layout/components/SectionHeader";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

import { StockListDetailVM } from "../hooks";
import {
  ShoppingGroupView,
  ShoppingRowView,
} from "../models/ShoppingListDetailUIModel";
import useStyles from "../styles";
import stockListDetailTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StockListDetailVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function money(cents: number) {
    return formatAmount(cents, vm.languageTag, vm.currency);
  }

  function quantityText(quantity: number, unit: StockUnits) {
    const display = formatQuantity(quantity, unit, vm.languageTag);

    return `${display.text} ${t(display.unitKey)}`;
  }

  function stockLine(row: ShoppingRowView) {
    return row.stockParts
      .map((part) =>
        t(part.key, {
          quantity: quantityText(
            part.params.quantity as number,
            row.entity.unit,
          ),
          unit: "",
        }).trim(),
      )
      .join(" · ");
  }

  function priceLine(row: ShoppingRowView) {
    const { entity } = row;

    if (entity.unitPriceCents === undefined) {
      return undefined;
    }

    return entity.priceSource === "MANUAL"
      ? t("stock.lists.priceSource.manual")
      : t("stock.lists.priceSource.history");
  }

  function renderRow(row: ShoppingRowView) {
    const { entity } = row;
    const noPrice = entity.estimateCents === undefined;
    const subtitle = row.stockParts.length > 0 ? stockLine(row) : undefined;
    const note = row.noteKey ? t(row.noteKey as TranslationKeys) : undefined;

    return (
      <View
        key={row.id}
        style={styles.row}
        testID={`${stockListDetailTestIds.row}-${row.id}`}
      >
        <View accessible={false} style={styles.rowMain}>
          <View style={styles.badges}>
            <Button.Ghost
              label={entity.description}
              onPress={() => vm.onRowPress(row.id)}
            />
            {row.badge ? (
              <Badge
                label={t(row.badge.labelKey)}
                testID={stockListDetailTestIds[row.badge.testID]}
                tone={row.badge.tone}
              />
            ) : null}
          </View>
          {subtitle || note ? (
            <Text.Caption value={subtitle ?? note ?? ""} />
          ) : null}
        </View>
        <View style={styles.rowAmounts}>
          <Text.BodyStrong value={quantityText(entity.quantity, entity.unit)} />
          {noPrice ? (
            <Text.Caption value={t("stock.lists.noPrice")} />
          ) : (
            <>
              <AmountText
                currency={vm.currency}
                size="body"
                value={entity.estimateCents as number}
              />
              <Text.Caption value={priceLine(row) ?? ""} />
            </>
          )}
        </View>
        {vm.readOnly ? null : (
          <IconButton
            accessibilityLabel={t("stock.lists.removeA11yLabel", {
              name: entity.description,
            })}
            name="close"
            onPress={async () => vm.onRemove(entity)}
            testID={`${stockListDetailTestIds.remove}-${row.id}`}
          />
        )}
      </View>
    );
  }

  function renderGroup(group: ShoppingGroupView) {
    const title = group.name || t("stock.lists.other");

    return (
      <View
        key={group.id}
        style={styles.sheetBody}
        testID={`${stockListDetailTestIds.group}-${group.id}`}
      >
        <View style={styles.groupHeader}>
          <Text.Overline value={`${title} · ${group.rows.length}`} />
          <Text.Caption
            value={
              group.unpricedCount > 0
                ? t("stock.lists.subtotalUnpriced", {
                    amount: money(group.subtotalCents),
                    count: group.unpricedCount,
                  })
                : t("stock.lists.subtotal", {
                    amount: money(group.subtotalCents),
                  })
            }
          />
        </View>
        <Card>{group.rows.map(renderRow)}</Card>
      </View>
    );
  }

  function renderBody() {
    if (vm.isLoading) {
      return (
        <View testID={stockListDetailTestIds.loading}>
          {[0, 1, 2, 3].map((key) => (
            <Skeleton.ListItem key={key} />
          ))}
        </View>
      );
    }

    if (vm.isNotFound) {
      return (
        <EmptyState
          actionLabel={t("stock.lists.back")}
          message={t("stock.lists.notFound")}
          onAction={vm.onBack}
          testID={stockListDetailTestIds.notFound}
          title={t("stock.lists.title")}
        />
      );
    }

    if (vm.errorMessageKey || !vm.model || !vm.list) {
      return (
        <ErrorState
          message={t(vm.errorMessageKey ?? "stock.lists.errorLoad")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={stockListDetailTestIds.error}
        />
      );
    }

    return (
      <>
        {vm.readOnly ? null : (
          <AutocompleteField
            label={t("stock.lists.addPlaceholder")}
            mode="text"
            onChangeText={vm.onSearchChange}
            onSelect={async (suggestion) =>
              vm.onSelectSuggestion(suggestion.id, suggestion.label)
            }
            prefiltered
            suggestions={vm.addSuggestions.map((suggestion) => ({
              ...suggestion,
              label:
                suggestion.id === "__text__"
                  ? t("stock.lists.addAsText", { text: suggestion.label })
                  : suggestion.label,
            }))}
            testID={stockListDetailTestIds.add}
            value={vm.search}
          />
        )}
        {vm.model.isEmpty ? (
          <Text.Body
            testID={stockListDetailTestIds.empty}
            tone="secondary"
            value={t("stock.lists.empty")}
          />
        ) : (
          vm.model.groups.map(renderGroup)
        )}
      </>
    );
  }

  const totals = vm.model?.detail.totals;
  let subtitle: string | undefined;

  if (vm.list && totals) {
    subtitle = [
      vm.ownerName,
      t(pluralKey("stock.lists.itemsCount", totals.rowCount), {
        count: totals.rowCount,
      }),
      totals.autoCount > 0
        ? t(pluralKey("stock.lists.autoCount", totals.autoCount), {
            count: totals.autoCount,
          })
        : undefined,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return (
    <Screen scroll testID={stockListDetailTestIds.screen}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Button.Ghost
            label={`‹ ${t("stock.sections.lists")}`}
            onPress={vm.onBack}
            testID={stockListDetailTestIds.back}
          />
          <SectionHeader
            actions={
              vm.readOnly || !vm.list ? null : (
                <View style={styles.badges}>
                  <Button.Primary
                    label={t("stock.purchase.goShopping")}
                    onPress={vm.onGoShopping}
                    testID={stockListDetailTestIds.goShopping}
                  />
                  <Button.Secondary
                    label={t("stock.lists.edit")}
                    onPress={vm.onEditList}
                    testID={stockListDetailTestIds.editButton}
                  />
                </View>
              )
            }
            section="lists"
            subtitle={subtitle}
            title={vm.list?.name}
          />
          {totals && totals.pricedCount > 0 ? (
            <View style={styles.priceBox} testID={stockListDetailTestIds.total}>
              <AmountText
                currency={vm.currency}
                size="heading"
                value={totals.estimatedTotalCents}
              />
              <Text.Caption
                value={t("stock.lists.coverage", {
                  priced: totals.pricedCount,
                  total: totals.rowCount,
                })}
              />
            </View>
          ) : null}
          {vm.readOnly ? (
            <ReadOnlyNotice
              message={t("family.archived.banner")}
              testID={stockListDetailTestIds.readOnlyBanner}
            />
          ) : null}
          {vm.openPurchases.map((entry) => (
            <Card key={entry.id}>
              <Button.Ghost
                label={`${
                  entry.status === "ENDED"
                    ? t("stock.purchase.ended")
                    : t("stock.purchase.cart", { count: entry.cartCount })
                } · ${
                  entry.status === "ENDED"
                    ? t("stock.purchase.close")
                    : t("stock.purchase.enter")
                }`}
                onPress={() => vm.onOpenPurchase(entry.id)}
                testID={`${stockListDetailTestIds.purchase}-${entry.id}`}
              />
            </Card>
          ))}
          {vm.mergedMessage ? (
            <StatusBanner
              dismissLabel={t("common.actions.close")}
              message={t("stock.lists.mergedDone", {
                list: vm.mergedMessage.list,
                total: quantityText(
                  vm.mergedMessage.quantity,
                  vm.mergedMessage.unit,
                ),
              })}
              onDismiss={vm.onMergedHide}
              testID={stockListDetailTestIds.mergedNotice}
            />
          ) : null}
        </View>
        {renderBody()}
      </View>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            label={t("stock.lists.save")}
            onPress={vm.onRowSave}
            testID={stockListDetailTestIds.rowSave}
          />
        }
        footerStart={
          vm.selectedRow ? (
            <Button.Ghost
              label={t("stock.lists.remove")}
              onPress={async () =>
                vm.onRemove((vm.selectedRow as ShoppingRowView).entity)
              }
              testID={stockListDetailTestIds.rowSheetRemove}
            />
          ) : undefined
        }
        onClose={vm.onRowClose}
        size="dialog"
        testID={stockListDetailTestIds.rowSheet}
        title={t("stock.lists.editRowTitle")}
        visible={!!vm.selectedRow}
      >
        {vm.selectedRow ? (
          <View style={styles.sheetBody}>
            <Text.BodyStrong value={vm.selectedRow.entity.description} />
            {vm.selectedRow.isText ? (
              <TextField
                label={t("stock.lists.descriptionLabel")}
                maxLength={100}
                onChangeText={vm.onDescriptionChange}
                value={vm.description}
              />
            ) : null}
            <QuantityField
              input={vm.quantity}
              label={t("stock.lists.quantity")}
              onChange={vm.onQuantityChange}
              testID={stockListDetailTestIds.rowSheetQuantity}
              unit={vm.selectedRow.entity.unit}
            />
            <AmountInput
              currency={vm.currency}
              label={t("stock.lists.estimatedPrice")}
              onChange={vm.onPriceChange}
              testID={stockListDetailTestIds.rowSheetPrice}
              value={vm.priceCents}
            />
          </View>
        ) : null}
      </BottomSheet>
      <Toast
        actionLabel={t("stock.lists.undo")}
        actionTestID={stockListDetailTestIds.undo}
        durationMs={vm.undoDurationMs}
        message={
          vm.removed
            ? t(
                vm.removed.comesBack
                  ? "stock.lists.removedAuto"
                  : "stock.lists.removedManual",
                { name: vm.removed.name },
              )
            : ""
        }
        onAction={vm.onUndo}
        onHide={vm.onNoticeHide}
        testID={stockListDetailTestIds.undoNotice}
        visible={!!vm.removed}
      />
      <Toast
        message={t("common.errors.generic")}
        onHide={vm.onFailedHide}
        visible={vm.failed}
      />
    </Screen>
  );
}

export default Wide;
