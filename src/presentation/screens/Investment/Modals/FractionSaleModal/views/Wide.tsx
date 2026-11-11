import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  DateField,
  ErrorState,
  IconButton,
  SelectField,
  SwitchRow,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import investmentTestIds from "@screens/Investment/testIds";

import { FractionSaleModalVM } from "../hooks";

const ids = investmentTestIds.modal.fractionSale;

// Spec 108 section 8 ("Vender fração"): a bottom sheet on mobile and a small one-column dialog on web/tablet.
function Wide({ vm }: AdaptiveViewProps<FractionSaleModalVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    body: { gap: spacing.md },
    cell: { flex: 1 },
    feeRow: { alignItems: "flex-end", flexDirection: "row", gap: spacing.sm },
    row: { flexDirection: "row", gap: spacing.sm },
    strip: { flexDirection: "row", justifyContent: "space-between" },
  });
  const currency = vm.currency as CurrencyCode;

  function renderBody() {
    if (vm.isNotFound) {
      return (
        <ErrorState
          message={t("investment.detail.notFound")}
          onRetry={vm.onClose}
          retryLabel={t("investment.form.close")}
        />
      );
    }

    if (vm.isLoading) {
      return <Skeleton.ListItem />;
    }

    return (
      <View style={styles.body}>
        <Text.Caption
          tone="secondary"
          value={t("investment.fraction.eventLine", {
            date: vm.eventDate,
            type: vm.eventTypeKey ? t(vm.eventTypeKey) : "",
          })}
        />
        <Text.BodyStrong
          value={t("investment.fraction.strip", {
            cost: vm.fractionCost,
            quantity: vm.fractionQuantity,
          })}
        />
        <View style={styles.row}>
          <View style={styles.cell}>
            <DateField
              error={
                vm.errors.date
                  ? t(`investment.fraction.dateErrors.${vm.errors.date}`)
                  : undefined
              }
              label={t("investment.fraction.receivedOn")}
              onChange={vm.onDateChange}
              testID={ids.date}
              value={vm.date}
            />
          </View>
          {vm.writeOff ? null : (
            <View style={styles.cell}>
              <AmountInput
                currency={currency}
                label={t("investment.fraction.auctionAmount")}
                onChange={vm.onGrossChange}
                testID={ids.gross}
                tone="income"
                value={vm.gross}
              />
            </View>
          )}
        </View>
        <SwitchRow
          label={t("investment.fraction.writeOff")}
          onToggle={vm.onWriteOffChange}
          testID={ids.writeOff}
          value={vm.writeOff}
        />
        {vm.writeOff ? (
          <Text.Caption
            tone="secondary"
            value={t("investment.fraction.writeOffHint")}
          />
        ) : (
          <>
            {vm.fees.map((fee, index) => (
              <View key={fee.key} style={styles.feeRow}>
                <View style={styles.cell}>
                  <SelectField
                    closeLabel={t("investment.form.close")}
                    label={t("investment.form.operation.feeKind")}
                    onChange={(kind) => vm.onFeeKindChange(fee.key, kind)}
                    options={vm.feeKinds.map((kind) => ({
                      label: t(`investment.fee.${kind}`),
                      value: kind,
                    }))}
                    sheetTitle={t("investment.form.operation.feeKind")}
                    testID={`${ids.account}-fee-kind-${index}`}
                    value={fee.kind}
                  />
                </View>
                <View style={styles.cell}>
                  <AmountInput
                    currency={currency}
                    label={t("investment.form.operation.feeAmount")}
                    onChange={(cents) => vm.onFeeAmountChange(fee.key, cents)}
                    testID={`${ids.account}-fee-amount-${index}`}
                    value={fee.amountCents}
                  />
                </View>
                <IconButton
                  accessibilityLabel={t("investment.form.operation.removeFee")}
                  name="close"
                  onPress={() => vm.onFeeRemove(fee.key)}
                  testID={`${ids.account}-fee-remove-${index}`}
                />
              </View>
            ))}
            {vm.fees.length < 2 ? (
              <Button.Ghost
                inline
                label={`+ ${t("investment.form.operation.addFee")}`}
                onPress={vm.onAddFee}
                testID={`${ids.account}-add-fee`}
              />
            ) : null}
            {vm.errors.fees ? (
              <Text.Caption
                tone="expense"
                value={t("investment.errors.feesAboveSale")}
              />
            ) : null}
            <SelectField
              closeLabel={t("investment.form.close")}
              error={
                vm.errors.account
                  ? t("investment.form.operation.accountRequired")
                  : undefined
              }
              label={t("investment.form.operation.account")}
              onChange={vm.onAccountChange}
              options={vm.accountOptions}
              sheetTitle={t("investment.form.operation.account")}
              testID={ids.account}
              value={vm.accountId}
            />
            <Text.Caption
              tone="secondary"
              value={t("investment.fraction.accountHint")}
            />
          </>
        )}
        <View style={styles.strip} testID={ids.result}>
          <Text.Body value={t("investment.fraction.realized")} />
          <Text.BodyStrong tabular tone={vm.realizedTone} value={vm.realized} />
        </View>
        <Text.Caption
          tone="secondary"
          value={t("investment.fraction.positionUnchanged")}
        />
        {vm.failure ? (
          <Text.Body
            tone="expense"
            value={t(vm.failure.key, vm.failure.params)}
          />
        ) : null}
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("investment.form.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t(
            vm.isEdit
              ? "investment.fraction.saveEdit"
              : "investment.fraction.save",
          )}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={ids.save}
        />
      }
      footerStart={
        vm.isEdit ? (
          <Button.Ghost
            label={t("investment.form.operation.deleteTitle")}
            onPress={vm.onDelete}
            testID={ids.delete}
            tone="expense"
          />
        ) : undefined
      }
      onClose={vm.onClose}
      presentation="inline"
      size="dialog"
      title={t(
        vm.isEdit
          ? "investment.fraction.editTitle"
          : "investment.fraction.title",
        {
          ticker: vm.assetLabel,
        },
      )}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
