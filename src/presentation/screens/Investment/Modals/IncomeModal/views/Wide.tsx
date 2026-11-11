import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  DateField,
  ErrorState,
  FormColumns,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import investmentTestIds from "@screens/Investment/testIds";

import { IncomeModalVM } from "../hooks";

const ids = investmentTestIds.modal.income;

// Spec 107 section 8: two columns in the wide `form` sheet (880 px), one compact stack on mobile.
function Wide({ vm }: AdaptiveViewProps<IncomeModalVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    cell: { flex: 1 },
    field: { gap: spacing.xs },
    form: { gap: spacing.md },
    row: { flexDirection: "row", gap: spacing.sm },
    stack: { gap: spacing.md },
  });
  const state = vm.state;

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

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

    if (vm.isLoading || !state) {
      return (
        <View>
          <Skeleton.ListItem />
          <Skeleton.ListItem />
        </View>
      );
    }

    const planned = state.status === InvestmentIncomeStatus.PLANNED;

    return (
      <View style={styles.form}>
        <FormColumns
          left={
            <View style={styles.stack}>
              <View style={styles.field}>
                <SelectField
                  closeLabel={t("investment.form.close")}
                  label={t("investment.income.type")}
                  onChange={(value) =>
                    vm.onTypeChange(value as (typeof vm.typeOptions)[number])
                  }
                  options={vm.typeOptions.map((type) => ({
                    label: t(`investment.income.types.${type}`),
                    value: type,
                  }))}
                  sheetTitle={t("investment.income.type")}
                  testID={ids.type}
                  value={state.type}
                />
                {vm.isApproving ? (
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.income.typeHint")}
                  />
                ) : null}
              </View>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <DateField
                    label={t("investment.income.exDate")}
                    onChange={vm.onExDateChange}
                    testID={ids.exDate}
                    value={state.exDate}
                  />
                </View>
                <View style={styles.cell}>
                  <DateField
                    label={t(
                      planned
                        ? "investment.income.paymentDate"
                        : "investment.income.receivedOn",
                    )}
                    onChange={vm.onPaymentDateChange}
                    testID={ids.paymentDate}
                    value={state.paymentDate}
                  />
                </View>
              </View>
              <SegmentedControl
                accessibilityLabel={t("investment.income.statusLabel")}
                onChange={(value) =>
                  vm.onStatusChange(value as InvestmentIncomeStatus)
                }
                options={[
                  {
                    label: t("investment.income.status.PLANNED"),
                    value: InvestmentIncomeStatus.PLANNED,
                  },
                  {
                    label: t("investment.income.status.RECEIVED"),
                    tone: "income",
                    value: InvestmentIncomeStatus.RECEIVED,
                  },
                ]}
                testID={ids.status}
                value={state.status}
              />
            </View>
          }
          right={
            <View style={styles.stack}>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <TextField
                    error={err(vm.errors.quantity)}
                    keyboardType="decimal-pad"
                    label={t("investment.income.quantity")}
                    onChangeText={vm.onQuantityChange}
                    testID={ids.quantity}
                    value={state.quantity}
                  />
                </View>
                <View style={styles.cell}>
                  <TextField
                    error={err(vm.errors.amountPerUnit)}
                    keyboardType="decimal-pad"
                    label={t("investment.income.perUnit")}
                    onChangeText={vm.onPerUnitChange}
                    testID={ids.perUnit}
                    value={state.perUnit}
                  />
                </View>
              </View>
              <View style={styles.field}>
                <AmountInput
                  currency={vm.currency as CurrencyCode}
                  error={err(vm.errors.netAmount)}
                  label={t("investment.income.netAmount")}
                  onChange={vm.onNetChange}
                  testID={ids.netAmount}
                  tone="income"
                  value={vm.net}
                />
                <Text.Caption
                  tone="secondary"
                  value={t("investment.income.netAmountHint")}
                />
              </View>
              {vm.estimate.show ? (
                <Card testID={ids.estimate}>
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.income.estimate", {
                      gross: vm.estimate.gross,
                      rate: vm.estimate.rate,
                    })}
                  />
                </Card>
              ) : null}
              <View style={styles.row}>
                <View style={styles.cell}>
                  <SelectField
                    closeLabel={t("investment.form.close")}
                    error={err(vm.errors.accountId)}
                    helper={vm.accountHint ? t(vm.accountHint) : undefined}
                    label={t("investment.form.operation.account")}
                    onChange={vm.onAccountChange}
                    options={vm.accountOptions}
                    sheetTitle={t("investment.form.operation.account")}
                    testID={ids.account}
                    value={state.accountId}
                  />
                </View>
                <View style={styles.cell}>
                  <SelectField
                    closeLabel={t("investment.form.close")}
                    error={err(vm.errors.categoryId)}
                    helper={
                      vm.categoryHint
                        ? t(vm.categoryHint, {
                            type: t(`investment.income.types.${state.type}`),
                          })
                        : undefined
                    }
                    label={t("investment.income.category")}
                    onChange={vm.onCategoryChange}
                    options={vm.categoryOptions}
                    sheetTitle={t("investment.income.category")}
                    testID={ids.category}
                    value={state.categoryId}
                  />
                </View>
              </View>
            </View>
          }
          testID={ids.save}
        />
        <TextField
          label={t("investment.income.notes")}
          multiline
          onChangeText={vm.onNotesChange}
          testID={ids.notes}
          value={state.notes}
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
    <>
      <BottomSheet
        closeLabel={t("investment.form.close")}
        footer={
          <Button.Primary
            fullWidth
            label={t(vm.saveLabelKey)}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size="lg"
            testID={ids.save}
          />
        }
        footerStart={
          vm.isEditing ? (
            <Button.Ghost
              label={t("investment.income.delete")}
              onPress={vm.onDeleteOpen}
              testID={ids.delete}
              tone="expense"
            />
          ) : undefined
        }
        onClose={vm.onClose}
        presentation="inline"
        size="form"
        subtitle={vm.assetLabel || undefined}
        title={t(vm.titleKey)}
        visible
      >
        {renderBody()}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("investment.form.cancel")}
        closeLabel={t("investment.form.close")}
        confirmLabel={t("investment.income.delete")}
        loading={vm.isSaving}
        message={t("investment.form.operation.deleteBody")}
        onCancel={vm.onDeleteClose}
        onConfirm={vm.onDelete}
        title={t("investment.income.delete")}
        visible={vm.isDeleteOpen}
      />
    </>
  );
}

export default Wide;
