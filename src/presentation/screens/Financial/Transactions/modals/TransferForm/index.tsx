import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ConfirmDialog,
  DateField,
  FormColumns,
  RadioGroup,
  SegmentedControl,
  SelectField,
  SwitchRow,
  Text,
  TextField,
  Toast,
} from "@components";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { useBreakpoint } from "@presentation/theme";
import { RECURRENCE_FREQUENCIES } from "@screens/Financial/models/recurrence";

import { useTransferFormViewModel } from "./hooks";
import { MAX_NOTES } from "./models/transferFormState";
import transferFormTestIds from "./testIds";

type Mode = "TRANSACTION_EXPENSE" | "TRANSACTION_INCOME" | "TRANSFER";

interface Props {
  // The type control is shared with the transaction form: picking Despesa or Receita goes back to it.
  onSwitchType: (type: "EXPENSE" | "INCOME") => void;
}

const TOAST_BOTTOM = { compact: 176, wide: 32 };

function TransferForm(props: Props) {
  const { t } = useTranslation();
  const vm = useTransferFormViewModel();
  const toastBottom =
    useBreakpoint() === "compact" ? TOAST_BOTTOM.compact : TOAST_BOTTOM.wide;
  const state = vm.state;

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  function accountField(
    kind: "from" | "to",
    value: string | undefined,
    error?: TranslationKeys,
  ) {
    return (
      <SelectField
        closeLabel={t("common.actions.close")}
        error={err(error)}
        label={t(
          kind === "from"
            ? "financial.transfers.form.fromAccount"
            : "financial.transfers.form.toAccount",
        )}
        onChange={
          kind === "from" ? vm.onFromAccountChange : vm.onToAccountChange
        }
        options={vm.accountOptions.map((option) => ({
          description: option.description,
          label: option.label,
          value: option.value,
        }))}
        sheetTitle={t("financial.transfers.form.accountSheet")}
        testID={
          kind === "from" ? transferFormTestIds.from : transferFormTestIds.to
        }
        value={value}
      />
    );
  }

  function renderRate() {
    if (!vm.rate || !vm.currencyIn || !vm.currencyOut) {
      return null;
    }
    const [unit, other] =
      vm.rate.base === "IN"
        ? [vm.currencyIn, vm.currencyOut]
        : [vm.currencyOut, vm.currencyIn];

    return (
      <Text.Caption
        testID={transferFormTestIds.rateText}
        tone="secondary"
        value={t("financial.transfers.form.rateText", {
          in: unit,
          out: other,
          value: String(vm.rate.value).replace(".", ","),
        })}
      />
    );
  }

  function renderBody() {
    if (!state || vm.isLoading) {
      return null;
    }

    return (
      <View>
        <FormColumns
          left={
            <>
              <SegmentedControl
                accessibilityLabel={t("financial.categories.type")}
                onChange={(value) => {
                  if (value !== "TRANSFER") {
                    props.onSwitchType(value as "EXPENSE" | "INCOME");
                  }
                }}
                options={[
                  {
                    label: t("financial.common.expense"),
                    tone: "expense",
                    value: "EXPENSE",
                  },
                  {
                    label: t("financial.common.income"),
                    tone: "income",
                    value: "INCOME",
                  },
                  { label: t("financial.transfers.type"), value: "TRANSFER" },
                ]}
                testID={transferFormTestIds.type}
                value={"TRANSFER" as Mode}
              />
              <TextField
                error={err(vm.errors.description)}
                label={t("financial.transfers.form.description")}
                maxLength={200}
                onChangeText={vm.onDescriptionChange}
                testID={transferFormTestIds.description}
                value={state.description}
              />
              {accountField("from", vm.fromAccountId, vm.errors.fromAccountId)}
              <AmountInput
                currency={vm.currencyOut ?? "BRL"}
                error={err(vm.errors.amountOut)}
                label={t("financial.transfers.form.amountOut")}
                onChange={vm.onAmountOutChange}
                testID={transferFormTestIds.amountOut}
                tone="expense"
                value={state.amountOutCents}
              />
              <Button.Ghost
                disabled={vm.isBlocking}
                label={t("financial.transfers.form.swap")}
                onPress={vm.onAccountSwap}
                testID={transferFormTestIds.swap}
              />
              {accountField("to", vm.toAccountId, vm.errors.toAccountId)}
              {vm.currencyIn && vm.currencyOut !== vm.currencyIn ? (
                <>
                  <SegmentedControl
                    accessibilityLabel={t("financial.transfers.form.rate")}
                    onChange={(value) =>
                      vm.onRateModeChange(value as "AMOUNT_IN" | "RATE")
                    }
                    options={[
                      {
                        label: t("financial.transfers.form.amountIn"),
                        value: "AMOUNT_IN",
                      },
                      {
                        label: t("financial.transfers.form.rate"),
                        value: "RATE",
                      },
                    ]}
                    testID={transferFormTestIds.rateMode}
                    value={state.rateMode}
                  />
                  {state.rateMode === "AMOUNT_IN" ? (
                    <AmountInput
                      currency={vm.currencyIn}
                      error={err(vm.errors.amountIn)}
                      label={t("financial.transfers.form.amountIn")}
                      onChange={vm.onAmountInChange}
                      testID={transferFormTestIds.amountIn}
                      tone="income"
                      value={state.amountInCents}
                    />
                  ) : (
                    <>
                      <TextField
                        error={err(vm.errors.amountIn)}
                        keyboardType="decimal-pad"
                        label={t("financial.transfers.form.rate")}
                        onChangeText={vm.onRateChange}
                        testID={transferFormTestIds.rate}
                        value={vm.rateText}
                      />
                      <AmountInput
                        currency={vm.currencyIn}
                        label={t("financial.transfers.form.amountIn")}
                        onChange={() => undefined}
                        testID={transferFormTestIds.amountIn}
                        tone="income"
                        value={vm.amountInCents}
                      />
                    </>
                  )}
                  {renderRate()}
                </>
              ) : null}
            </>
          }
          right={
            <>
              {vm.isRecurring ? (
                <RadioGroup
                  accessibilityLabel={t("financial.recurrence.editScope")}
                  onChange={(value) =>
                    vm.onScopeChange(value as InstallmentScope)
                  }
                  options={[
                    {
                      label: t("financial.recurrence.scope.onlyThis"),
                      value: "ONLY_THIS",
                    },
                    {
                      label: t("financial.recurrence.scope.thisAndNext"),
                      value: "THIS_AND_NEXT",
                    },
                  ]}
                  testID={transferFormTestIds.scope}
                  value={vm.scope}
                />
              ) : null}
              <DateField
                label={t("financial.transfers.form.dateOut")}
                onChange={(date) => date && vm.onDateOutChange(date)}
                testID={transferFormTestIds.dateOut}
                todayLabel={t("common.date.today")}
                value={state.dateOut}
                yesterdayLabel={t("common.date.yesterday")}
              />
              <DateField
                error={err(vm.errors.dateIn)}
                label={t("financial.transfers.form.dateIn")}
                onChange={(date) => date && vm.onDateInChange(date)}
                testID={transferFormTestIds.dateIn}
                todayLabel={t("common.date.today")}
                value={state.dateIn}
                yesterdayLabel={t("common.date.yesterday")}
              />
              {vm.daysLater > 0 ? (
                <>
                  <Text.Caption
                    tone="secondary"
                    value={t(
                      pluralKey(
                        "financial.transfers.form.dateInLater",
                        vm.daysLater,
                      ),
                      { count: vm.daysLater },
                    )}
                  />
                  <Button.Ghost
                    label={t("financial.transfers.form.sameDate")}
                    onPress={vm.onSameDate}
                    testID={transferFormTestIds.sameDate}
                  />
                </>
              ) : null}
              <AmountInput
                currency={vm.currencyIn ?? vm.currencyOut ?? "BRL"}
                error={err(vm.errors.fee)}
                label={t("financial.transfers.form.fee")}
                onChange={vm.onFeeChange}
                testID={transferFormTestIds.fee}
                tone="expense"
                value={state.feeCents}
              />
              <Text.Caption
                tone="secondary"
                value={t("financial.transfers.form.feeHint")}
              />
              <SwitchRow
                hint={t("financial.transfers.form.paidHint")}
                label={t("financial.transfers.form.paid")}
                onToggle={vm.onPaidChange}
                testID={transferFormTestIds.paid}
                value={state.paid}
              />
              {vm.isEditing ? null : (
                <SwitchRow
                  label={t("financial.transfers.form.repeat")}
                  onToggle={vm.onRepeatToggle}
                  testID={transferFormTestIds.repeat}
                  value={state.repeatOn}
                />
              )}
              {state.repeatOn && !vm.isEditing ? (
                <>
                  <SelectField
                    closeLabel={t("common.actions.close")}
                    label={t("financial.transfers.form.repeat")}
                    onChange={(value) =>
                      vm.onRepeatFrequencyChange(value as RecurrenceFrequency)
                    }
                    options={RECURRENCE_FREQUENCIES.map((frequency) => ({
                      label: t(`financial.recurrence.frequency.${frequency}`),
                      value: frequency,
                    }))}
                    sheetTitle={t("financial.transfers.form.repeat")}
                    testID={transferFormTestIds.repeatFrequency}
                    value={state.repeatFrequency}
                  />
                  <DateField
                    clearable
                    clearLabel={t("financial.transactions.form.repeatEndClear")}
                    label={t("financial.transactions.form.repeatEnd")}
                    onChange={vm.onRepeatEndChange}
                    placeholder={t("financial.recurrence.noEnd")}
                    testID={transferFormTestIds.repeatEnd}
                    todayLabel={t("common.date.today")}
                    value={state.repeatEnd}
                    yesterdayLabel={t("common.date.yesterday")}
                  />
                </>
              ) : null}
              <TextField
                counter={`${state.notes.length}/${MAX_NOTES}`}
                label={t("financial.transactions.form.notes")}
                maxLength={MAX_NOTES}
                minLines={3}
                multiline
                onChangeText={vm.onNotesChange}
                testID={transferFormTestIds.notes}
                value={state.notes}
              />
              {vm.errorKey ? (
                <Text.Body
                  testID={transferFormTestIds.formError}
                  tone="expense"
                  value={t(vm.errorKey)}
                />
              ) : null}
            </>
          }
        />
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            disabled={vm.isBlocking || !state}
            fullWidth
            label={t(
              vm.isEditing
                ? "financial.common.saveChanges"
                : "financial.transfers.form.save",
            )}
            loading={vm.isBlocking && !vm.isSavingNext}
            onPress={vm.onSave}
            size={"lg"}
            testID={transferFormTestIds.saveButton}
          />
        }
        footerSecondary={
          vm.canSaveAndNew && (
            <Button.Secondary
              disabled={vm.isBlocking || !state}
              fullWidth
              label={t("financial.transfers.form.saveAndNew")}
              loading={vm.isSavingNext}
              onPress={vm.onSaveAndNew}
              size={"lg"}
              testID={transferFormTestIds.saveAndNewButton}
            />
          )
        }
        footerStart={
          vm.isEditing && (
            <Button.Ghost
              disabled={vm.isBlocking}
              label={t("financial.transfers.menu.delete")}
              onPress={vm.onDeletePress}
              testID={transferFormTestIds.deleteButton}
              tone={"expense"}
            />
          )
        }
        onClose={vm.onClose}
        presentation={"inline"}
        size={"form"}
        testID={transferFormTestIds.sheet}
        title={t(
          vm.isEditing
            ? "financial.transfers.form.editTitle"
            : "financial.transfers.form.title",
        )}
        visible
      >
        <View
          pointerEvents={vm.isBlocking ? "none" : "auto"}
          style={vm.isBlocking ? { opacity: 0.6 } : undefined}
        >
          {renderBody()}
        </View>
      </BottomSheet>
      <Toast
        bottom={toastBottom}
        message={t("financial.transactions.form.saved")}
        onHide={vm.onSavedHide}
        testID={transferFormTestIds.savedToast}
        visible={vm.isSaved}
      />
      <ConfirmDialog
        cancelLabel={t("common.form.keepEditing")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("common.form.discard")}
        message={t("common.form.discardMessage")}
        onCancel={vm.onDiscardCancel}
        onConfirm={vm.onDiscardConfirm}
        title={t("common.form.discardTitle")}
        visible={vm.isDiscardDialogOpen}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("common.actions.delete")}
        message={t("financial.transfers.delete.message")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={transferFormTestIds.deleteDialog}
        title={t("financial.transfers.delete.title")}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default TransferForm;
