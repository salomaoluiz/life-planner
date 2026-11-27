import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  CategoryTreeField,
  ConfirmDialog,
  DateField,
  ErrorState,
  FormColumns,
  OptionRow,
  SegmentedControl,
  SelectField,
  SwitchRow,
  Text,
  TextField,
  useTreePickerLabels,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentIncomeScope,
  InvestmentIncomeStatus,
} from "@domain/entities/investment/enums";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import RecurrenceBlock from "@screens/Financial/Transactions/components/RecurrenceBlock";
import investmentTestIds from "@screens/Investment/testIds";

import { IncomeModalVM } from "../hooks";

const ids = investmentTestIds.modal.income;

// Spec 107 section 8: two columns in the wide `form` sheet (880 px), one compact stack on mobile.
function Wide({ vm }: AdaptiveViewProps<IncomeModalVM>) {
  const { t } = useTranslation();
  const categoryLabels = useTreePickerLabels("category");
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
              {vm.isSeriesEdit ? (
                <DateField
                  clearable
                  error={err(vm.errors.endDate)}
                  label={t("investment.income.seriesModal.endDate")}
                  onChange={vm.onEndDateChange}
                  testID={investmentTestIds.modal.incomeSeries.endDate}
                  value={state.endDate}
                />
              ) : null}
              {!vm.isSeriesEdit && !vm.isScopeAll && vm.isSeries ? (
                <DateField
                  label={t("investment.income.firstPaymentDate")}
                  onChange={vm.onPaymentDateChange}
                  testID={ids.paymentDate}
                  value={state.paymentDate}
                />
              ) : null}
              {!vm.isSeriesEdit && !vm.isScopeAll && !vm.isSeries ? (
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
              ) : null}
              {vm.isScopeAll || vm.isSeries ? null : (
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
              )}
            </View>
          }
          right={
            <View style={styles.stack}>
              <View style={styles.row}>
                <View style={styles.cell}>
                  {vm.isSeries ? (
                    <TextField
                      disabled
                      label={t("investment.income.positionAtExDate")}
                      onChangeText={vm.onQuantityChange}
                      testID={ids.quantity}
                      value={vm.preview.firstQuantity ?? ""}
                    />
                  ) : null}
                  {!vm.isSeries && !vm.isScopeAll ? (
                    <TextField
                      error={err(vm.errors.quantity)}
                      keyboardType="decimal-pad"
                      label={t("investment.income.quantity")}
                      onChangeText={vm.onQuantityChange}
                      testID={ids.quantity}
                      value={state.quantity}
                    />
                  ) : null}
                </View>
                <View style={styles.cell}>
                  <TextField
                    error={err(vm.errors.amountPerUnit)}
                    keyboardType="decimal-pad"
                    label={t(
                      vm.isSeries || vm.isScopeAll
                        ? "investment.income.seriesModal.perUnit"
                        : "investment.income.perUnit",
                    )}
                    onChangeText={vm.onPerUnitChange}
                    testID={ids.perUnit}
                    value={state.perUnit}
                  />
                </View>
              </View>
              {vm.isSeries ? (
                <Card>
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.income.firstOccurrence", {
                      perUnit: state.perUnit || "—",
                      quantity: vm.preview.firstQuantity ?? "—",
                    })}
                  />
                  <Text.BodyStrong
                    tone="income"
                    value={
                      vm.preview.firstNet
                        ? t("investment.income.estimatedNet", {
                            net: vm.preview.firstNet,
                          })
                        : "—"
                    }
                  />
                </Card>
              ) : null}
              {!vm.isSeries && !vm.isScopeAll ? (
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
              ) : null}
              {vm.estimate.show && !vm.isSeries && !vm.isScopeAll ? (
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
              {vm.isApproving ? null : (
                <SwitchRow
                  hint={t("investment.income.withFinanceHint")}
                  label={t("investment.income.withFinance")}
                  onToggle={vm.onWithFinanceChange}
                  testID={ids.withFinance}
                  value={state.withFinance}
                />
              )}
              {state.withFinance ? null : (
                <Card>
                  <Text.BodyStrong
                    value={t("investment.income.withoutFinanceTitle")}
                  />
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.income.withoutFinanceBody")}
                  />
                </Card>
              )}
              {state.withFinance ? (
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
                    <CategoryTreeField
                      archivedLabel={t("financial.accounts.archivedLabel")}
                      error={err(vm.errors.categoryId)}
                      helper={
                        vm.categoryHint
                          ? t(vm.categoryHint, {
                              type: t(`investment.income.types.${state.type}`),
                            })
                          : undefined
                      }
                      label={t("investment.income.category")}
                      labels={categoryLabels}
                      mode={"single"}
                      nodes={vm.categoryNodes}
                      onChange={(id) => id && vm.onCategoryChange(id)}
                      testID={ids.category}
                      value={state.categoryId}
                    />
                  </View>
                </View>
              ) : null}
              {vm.repeatAllowed ? (
                <SwitchRow
                  hint={t("investment.income.repeatHint")}
                  label={t("investment.income.repeat")}
                  onToggle={vm.onRepeatChange}
                  testID={ids.repeat}
                  value={state.repeat}
                />
              ) : null}
              {vm.showSeriesBlock ? (
                <RecurrenceBlock
                  endDate={state.endDate}
                  frequency={state.frequency}
                  onChange={vm.onFrequencyChange}
                  startDate={state.paymentDate}
                  testIDs={{
                    error: ids.repeatError,
                    interval: ids.repeatInterval,
                    intervalDecrease: ids.repeatIntervalDecrease,
                    intervalIncrease: ids.repeatIntervalIncrease,
                    preview: ids.seriesPreview,
                    unit: ids.repeatUnit,
                  }}
                >
                  <DateField
                    clearable
                    error={err(vm.errors.endDate)}
                    label={t("investment.income.endDate")}
                    onChange={vm.onEndDateChange}
                    testID={ids.endDate}
                    value={state.endDate}
                  />
                  <TextField
                    error={err(vm.errors.exDateOffset)}
                    helper={t("investment.income.exDateOffsetLabel")}
                    keyboardType="number-pad"
                    label={t("investment.income.exDate")}
                    onChangeText={vm.onExDateOffsetChange}
                    testID={ids.exDateOffset}
                    value={state.exDateOffset}
                  />
                  {vm.isSeries ? (
                    <SwitchRow
                      hint={t("investment.income.markPastReceivedHint")}
                      label={t("investment.income.markPastReceived")}
                      onToggle={vm.onMarkPastChange}
                      testID={ids.markPastReceived}
                      value={state.markPast}
                    />
                  ) : null}
                  {vm.isSeries ? (
                    <Card testID={ids.seriesSummary}>
                      <Text.Caption
                        tone="secondary"
                        value={t("investment.income.seriesPreview.past", {
                          count: vm.preview.past,
                        })}
                      />
                      <Text.Caption
                        tone="secondary"
                        value={t("investment.income.seriesPreview.current", {
                          date: vm.preview.next[0] ?? "",
                        })}
                      />
                      <Text.Caption
                        tone="secondary"
                        value={t("investment.income.seriesPreview.next", {
                          dates: vm.preview.next.join(", "),
                        })}
                      />
                      <Text.Caption
                        tone="secondary"
                        value={
                          vm.preview.endsByPosition
                            ? t(
                                "investment.income.seriesPreview.endsByPosition",
                                {
                                  date: vm.preview.endsByPosition,
                                },
                              )
                            : t("investment.income.seriesPreview.positionEnd")
                        }
                      />
                    </Card>
                  ) : null}
                </RecurrenceBlock>
              ) : null}
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
            disabled={vm.saveDisabled}
            fullWidth
            label={t(vm.saveLabelKey, vm.saveLabelParams)}
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
      <BottomSheet
        closeLabel={t("investment.form.close")}
        onClose={vm.onScopeCancel}
        presentation="inline"
        size="dialog"
        title={t("investment.income.scope.titleEdit")}
        visible={vm.scopeDialogVisible}
      >
        <View style={styles.stack}>
          {(
            [
              InvestmentIncomeScope.ONLY_THIS,
              InvestmentIncomeScope.THIS_AND_NEXT,
              InvestmentIncomeScope.ALL,
            ] as const
          ).map((option) => (
            <OptionRow
              accessibilityLabel={t(`investment.income.scope.${option}`)}
              key={option}
              onPress={() => vm.onScopeSelect(option)}
              subtitle={t(`investment.income.scope.${option}_HINT`, {
                date: vm.scopeDate,
              })}
              testID={ids.scope(option)}
              title={t(`investment.income.scope.${option}`)}
            />
          ))}
        </View>
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
