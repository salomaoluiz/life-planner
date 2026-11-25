import { StyleSheet, View } from "react-native";

import { Badge, Button, ListItem, Text, TextField } from "@components";
import Spinner from "@components/Spinner";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import QuantityField from "@screens/Stock/components/QuantityField";

import { StockBarcodeVM } from "../hooks";
import stockBarcodeTestIds from "../testIds";

interface Props {
  vm: StockBarcodeVM;
}

// The code field (always there: a USB reader types into it) and what the last code found (spec 121 FR 6, 8-11).
function BarcodeResult({ vm }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    action: { flex: 1 },
    actions: { flexDirection: "row", gap: spacing.sm },
    badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    root: { gap: spacing.md },
    row: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing.md,
      justifyContent: "space-between",
    },
  });

  function renderMessage() {
    if (!vm.message) {
      return null;
    }

    return (
      <Text.Body
        accessibilityLiveRegion="polite"
        testID={stockBarcodeTestIds.message}
        tone="expense"
        value={t(
          vm.message === "notRecognized"
            ? "stock.barcode.notRecognized"
            : "stock.barcode.lookupFailed",
        )}
      />
    );
  }

  function renderAdded() {
    if (!vm.added) {
      return null;
    }

    return (
      <View
        accessibilityLiveRegion="polite"
        style={styles.row}
        testID={stockBarcodeTestIds.added}
      >
        <Text.Body value={t("stock.barcode.added", { name: vm.added.name })} />
        {vm.added.suggested ? (
          <Badge label={t("stock.barcode.suggested")} tone="neutral" />
        ) : null}
      </View>
    );
  }

  function renderOwnerPicker() {
    return (
      <View testID={stockBarcodeTestIds.ownerPicker}>
        <Text.Heading value={t("stock.barcode.whichStock")} />
        <Text.Caption value={t("stock.barcode.whichStockHint")} />
        {vm.matches.map((match, index) => (
          <ListItem
            divider
            key={`${match.ownerName}-${match.match.item.id}`}
            onPress={() => vm.onPickOwner(index)}
            subtitle={match.pickerSubtitle}
            testID={`${stockBarcodeTestIds.ownerOption}-${index}`}
            title={match.ownerName}
            trailing={
              <Text.BodyStrong
                value={`${match.quantity.text} ${t(match.quantity.unitKey)}`}
              />
            }
          />
        ))}
      </View>
    );
  }

  function renderSheet() {
    const { sheet } = vm;

    if (!sheet) {
      return null;
    }

    const quantity = `${sheet.quantity.text} ${t(sheet.quantity.unitKey)}`;

    return (
      <View
        accessibilityLabel={t("stock.barcode.found", { name: sheet.name })}
        accessibilityLiveRegion="polite"
        style={styles.root}
        testID={stockBarcodeTestIds.sheet}
      >
        <View style={styles.row}>
          <View>
            <Text.Heading value={sheet.name} />
            <Text.Caption value={sheet.subtitle} />
            <View style={styles.badges}>
              {sheet.badges.map((badge) => (
                <Badge
                  key={badge.labelKey}
                  label={t(badge.labelKey, badge.params)}
                  tone={badge.tone}
                />
              ))}
            </View>
          </View>
          <View>
            <Text.Caption value={t("stock.barcode.have")} />
            <Text.BodyStrong value={quantity} />
          </View>
        </View>
        {sheet.readOnly ? (
          <Text.Caption value={t("stock.barcode.readOnly")} />
        ) : (
          <>
            <QuantityField
              input={vm.quantity}
              label={t("stock.barcode.quantity")}
              onChange={vm.onQuantityChange}
              testID={stockBarcodeTestIds.quantity}
              unit={sheet.match.item.unit}
            />
            <View style={styles.actions}>
              <View style={styles.action}>
                <Button.Primary
                  fullWidth
                  label={t("stock.barcode.entered")}
                  onPress={() => vm.onAction(1)}
                  testID={stockBarcodeTestIds.enter}
                />
              </View>
              <View style={styles.action}>
                <Button.Secondary
                  fullWidth
                  label={t("stock.barcode.consumed")}
                  onPress={() => vm.onAction(-1)}
                  testID={stockBarcodeTestIds.consume}
                />
              </View>
              {sheet.canOpen ? (
                <View style={styles.action}>
                  <Button.Secondary
                    fullWidth
                    label={t("stock.barcode.opened")}
                    onPress={vm.onOpen}
                    testID={stockBarcodeTestIds.open}
                  />
                </View>
              ) : null}
            </View>
          </>
        )}
        <View style={styles.row}>
          <Button.Ghost
            inline
            label={t("stock.barcode.openDetail")}
            onPress={vm.onOpenDetail}
            testID={stockBarcodeTestIds.openDetail}
          />
          <Button.Secondary
            label={t("stock.barcode.scanAnother")}
            onPress={vm.onScanAnother}
            testID={stockBarcodeTestIds.scanAnother}
          />
        </View>
      </View>
    );
  }

  function renderBody() {
    if (vm.isLooking) {
      return (
        <View style={styles.row} testID={stockBarcodeTestIds.looking}>
          <Spinner accessibilityLabel={t("stock.barcode.looking")} />
          <Text.Body value={t("stock.barcode.looking")} />
        </View>
      );
    }

    return vm.showsOwnerPicker ? renderOwnerPicker() : renderSheet();
  }

  return (
    <View style={styles.root}>
      <TextField
        autoCorrect={false}
        helper={t("stock.barcode.usbHint")}
        label={t("stock.barcode.typeCode")}
        onChangeText={vm.onTypedChange}
        onSubmitEditing={vm.onSubmitTyped}
        returnKeyType="done"
        testID={stockBarcodeTestIds.codeInput}
        value={vm.typed}
      />
      {renderMessage()}
      {renderAdded()}
      {renderBody()}
    </View>
  );
}

export default BarcodeResult;
