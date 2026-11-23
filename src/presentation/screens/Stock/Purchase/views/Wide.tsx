import { View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  AmountText,
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  Screen,
  SegmentedControl,
  StatusBanner,
  Text,
  TextField,
  Toast,
} from "@components";
import Skeleton from "@components/Skeleton";
import { PurchaseStatuses } from "@domain/entities/stock/PurchaseEntity";
import { useTranslation } from "@presentation/i18n";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

import { PurchaseVM } from "../hooks";
import { CartRow, ToBuyRow } from "../models/PurchaseUIModel";
import useStyles from "../styles";
import purchaseTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<PurchaseVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function quantityText(quantity: number | undefined, unit: CartRow["unit"]) {
    if (quantity === undefined || !unit) {
      return "—";
    }

    const display = formatQuantity(quantity, unit, vm.languageTag);

    return `${display.text} ${t(display.unitKey)}`;
  }

  function renderToBuyAction(row: ToBuyRow, locked: boolean) {
    if (row.otherCart) {
      return <Text.Caption value={t("stock.purchase.readOnly")} />;
    }

    if (row.notFound) {
      return (
        <Button.Ghost
          label={t("stock.purchase.notFoundUndo")}
          onPress={async () => vm.onUndoNotFound(row)}
        />
      );
    }

    return (
      <Button.Ghost
        disabled={locked}
        label={t("stock.purchase.notFound")}
        onPress={async () => vm.onNotFound(row)}
      />
    );
  }

  function renderToBuy(row: ToBuyRow) {
    const locked = !!row.otherCart || !vm.isOpen;

    return (
      <View
        key={row.id}
        style={styles.row}
        testID={`${purchaseTestIds.toBuyRow}-${row.id}`}
      >
        <Button.Secondary
          accessibilityLabel={t("stock.purchase.addToCart")}
          disabled={locked}
          label=""
          onPress={() => vm.onTick(row)}
          testID={`${purchaseTestIds.tick}-${row.id}`}
        />
        <View style={styles.rowMain}>
          <Text.BodyStrong value={row.description} />
          {row.otherCart ? (
            <Text.Caption
              value={t("stock.purchase.inOtherCart", {
                market: row.otherCart.marketName,
                name: row.otherCart.userName,
              })}
            />
          ) : (
            <Text.Caption value={row.categoryPath ?? ""} />
          )}
        </View>
        <View style={styles.rowAmounts}>
          <Text.BodyStrong value={quantityText(row.quantity, row.unit)} />
          {renderToBuyAction(row, locked)}
        </View>
      </View>
    );
  }

  function renderCart(row: CartRow) {
    const percent = Math.abs(row.priceChangePercent ?? 0);

    return (
      <View
        key={row.id}
        style={styles.row}
        testID={`${purchaseTestIds.cartRow}-${row.id}`}
      >
        <View style={styles.rowMain}>
          <View style={styles.badges}>
            <Button.Ghost
              disabled={!vm.isOpen}
              label={row.description}
              onPress={() => vm.onCartRowPress(row)}
            />
            {row.priceChange !== "NONE" ? (
              <Badge
                label={t(
                  row.priceChange === "UP"
                    ? "stock.purchase.changeUp"
                    : "stock.purchase.changeDown",
                  { percent },
                )}
                tone={row.priceChange === "UP" ? "expense" : "income"}
              />
            ) : null}
            {row.unknownWeightOrPrice ? (
              <Badge label={t("stock.purchase.noWeight")} tone="warning" />
            ) : null}
            {row.outsideList ? (
              <Badge label={t("stock.purchase.outsideList")} tone="neutral" />
            ) : null}
            {row.pending ? (
              <Badge label={t("stock.purchase.pending")} tone="warning" />
            ) : null}
          </View>
          {row.checkedByName ? (
            <Text.Caption value={row.checkedByName} />
          ) : null}
        </View>
        <View style={styles.rowAmounts}>
          <Text.BodyStrong value={quantityText(row.quantity, row.unit)} />
          {row.lineTotalCents === undefined ? (
            <Text.Caption value="—" />
          ) : (
            <AmountText
              currency={vm.currency}
              size="body"
              value={row.lineTotalCents}
            />
          )}
        </View>
      </View>
    );
  }

  function sheetFooterStart() {
    if (vm.sheet?.listRowId) {
      return (
        <Button.Ghost
          label={t("stock.purchase.notFound")}
          onPress={vm.onSheetNotFound}
          testID={purchaseTestIds.sheetNotFound}
        />
      );
    }

    return vm.sheet && !vm.sheet.isNew ? (
      <Button.Ghost
        label={t("stock.purchase.unmark")}
        onPress={vm.onSheetRemove}
      />
    ) : undefined;
  }

  function renderBody() {
    if (vm.isLoading) {
      return (
        <View testID={purchaseTestIds.loading}>
          {[0, 1, 2].map((key) => (
            <Skeleton.ListItem key={key} />
          ))}
        </View>
      );
    }

    if (vm.errorMessageKey || !vm.model || !vm.purchase) {
      return (
        <ErrorState
          message={t(vm.errorMessageKey ?? "stock.purchase.errorLoad")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={purchaseTestIds.error}
        />
      );
    }

    return (
      <>
        {vm.isOpen ? (
          <View style={styles.actions}>
            <TextField
              label={t("stock.purchase.search")}
              onChangeText={vm.onSearchChange}
              testID={purchaseTestIds.search}
              value={vm.search}
            />
            {vm.search.trim().length >= 2 ? (
              <Button.Secondary
                label={`+ ${vm.search.trim()}`}
                onPress={vm.onAddOutside}
                testID={purchaseTestIds.addOutside}
              />
            ) : null}
          </View>
        ) : null}
        <Text.BodyStrong
          value={t("stock.purchase.toBuy", { count: vm.visibleToBuy.length })}
        />
        {vm.visibleToBuy.length === 0 ? (
          <Text.Body
            testID={purchaseTestIds.empty}
            tone="secondary"
            value={t("stock.purchase.empty")}
          />
        ) : (
          <Card>{vm.visibleToBuy.map(renderToBuy)}</Card>
        )}
        <Text.BodyStrong
          value={t("stock.purchase.cart", { count: vm.model.cart.length })}
        />
        <Card>{vm.model.cart.map(renderCart)}</Card>
      </>
    );
  }

  const purchase = vm.purchase;
  const status = purchase?.purchase.status;

  return (
    <Screen scroll testID={purchaseTestIds.screen}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Button.Ghost
            label={`‹ ${t("stock.purchase.back")}`}
            onPress={vm.onBack}
            testID={purchaseTestIds.back}
          />
          {vm.offlineCount > 0 ? (
            <StatusBanner
              message={t("stock.purchase.offline", { count: vm.offlineCount })}
              testID={purchaseTestIds.offline}
            />
          ) : null}
          {vm.closingBy ? (
            <StatusBanner
              message={t("stock.purchase.closingBy")}
              testID={purchaseTestIds.closing}
            />
          ) : null}
          {status === PurchaseStatuses.ENDED || vm.isEnded ? (
            <StatusBanner
              message={t("stock.purchase.ended")}
              testID={purchaseTestIds.ended}
            />
          ) : null}
          {purchase ? (
            <View style={styles.totals}>
              <View testID={purchaseTestIds.cartTotal}>
                <Text.Caption
                  value={t("stock.purchase.cart", { count: vm.cartCount })}
                />
                <AmountText
                  currency={vm.currency}
                  size="heading"
                  value={purchase.cart.totalCents}
                />
              </View>
              <View testID={purchaseTestIds.remaining}>
                <Text.Caption
                  value={t("stock.purchase.remaining", {
                    count: purchase.remaining.count,
                  })}
                />
                <AmountText
                  currency={vm.currency}
                  size="heading"
                  value={purchase.remaining.estimatedCents}
                />
              </View>
              <View testID={purchaseTestIds.forecast}>
                <Text.Caption value={t("stock.purchase.forecast")} />
                <AmountText
                  currency={vm.currency}
                  size="heading"
                  value={purchase.forecastCents}
                />
              </View>
            </View>
          ) : null}
          {purchase ? (
            <View style={styles.actions}>
              {vm.isOpen ? (
                <Button.Primary
                  label={t("stock.purchase.end")}
                  onPress={vm.onEnd}
                  testID={purchaseTestIds.end}
                />
              ) : null}
              {vm.isEnded ? (
                <Button.Secondary
                  label={t("stock.purchase.addToCart")}
                  onPress={vm.onReopen}
                />
              ) : null}
              <Button.Secondary
                disabled={vm.offlineCount > 0 || !!vm.closingBy}
                label={t("stock.purchase.close")}
                onPress={vm.onClose}
                testID={purchaseTestIds.close}
              />
              <Button.Ghost
                label={t("stock.purchase.discard")}
                onPress={vm.onDiscardAsk}
                testID={purchaseTestIds.discard}
              />
            </View>
          ) : null}
        </View>
        {renderBody()}
      </View>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            label={t("stock.purchase.addToCart")}
            onPress={vm.onSheetSave}
            testID={purchaseTestIds.sheetSave}
          />
        }
        footerStart={sheetFooterStart()}
        onClose={vm.onSheetClose}
        size="dialog"
        testID={purchaseTestIds.sheet}
        title={vm.sheet?.description ?? ""}
        visible={!!vm.sheet}
      >
        {vm.sheet ? (
          <View style={styles.sheetBody}>
            <TextField
              keyboardType="decimal-pad"
              label={t("stock.purchase.quantity")}
              onChangeText={(quantity) => vm.onSheetChange({ quantity })}
              testID={purchaseTestIds.sheetQuantity}
              value={vm.sheet.quantity}
            />
            <SegmentedControl
              accessibilityLabel={t("stock.purchase.price")}
              onChange={(value) =>
                vm.onSheetChange({ priceInput: value as "LINE" | "UNIT" })
              }
              options={[
                { label: t("stock.purchase.perUnit"), value: "UNIT" },
                { label: t("stock.purchase.lineTotal"), value: "LINE" },
              ]}
              testID={purchaseTestIds.sheetPriceType}
              value={vm.sheet.priceInput}
            />
            <AmountInput
              currency={vm.currency}
              label={t("stock.purchase.price")}
              onChange={(priceCents) => vm.onSheetChange({ priceCents })}
              testID={purchaseTestIds.sheetPrice}
              value={vm.sheet.priceCents}
            />
            <TextField
              label={t("stock.purchase.expiration")}
              onChangeText={(expiration) => vm.onSheetChange({ expiration })}
              placeholder="dd/mm/aaaa"
              testID={purchaseTestIds.sheetExpiration}
              value={vm.sheet.expiration}
            />
          </View>
        ) : null}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("stock.purchase.discard")}
        message={t("stock.purchase.discardConfirm", { count: vm.cartCount })}
        onCancel={vm.onDiscardCancel}
        onConfirm={vm.onDiscard}
        testID={purchaseTestIds.discardConfirm}
        title={t("stock.purchase.discard")}
        visible={vm.confirmDiscard}
      />
      <Toast
        message={
          vm.notice
            ? t("stock.purchase.conflict", {
                item: vm.notice.split("|")[0],
                name: vm.notice.split("|")[1] ?? "",
              })
            : ""
        }
        onHide={vm.onNoticeHide}
        testID={purchaseTestIds.notice}
        visible={!!vm.notice}
      />
      <Toast
        message={t("stock.purchase.errorSave")}
        onHide={vm.onFailedHide}
        visible={vm.failed}
      />
    </Screen>
  );
}

export default Wide;
