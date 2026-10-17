import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ConfirmDialog,
  DateField,
  ErrorState,
  HelperText,
  RadioGroup,
  SelectField,
  TextField,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";

import InstallmentPlanSheet from "./components/InstallmentPlanSheet";
import { useInstallmentEditViewModel } from "./hooks";
import useStyles from "./styles";
import { installmentEditTestIds, installmentPlanTestIds } from "./testIds";

// Edit one installment of a card purchase: which rows the edit reaches decides which fields are open (spec 030 FR 11-16).
function InstallmentEditModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = useInstallmentEditViewModel();
  const { state } = vm;

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  function lockedHelper() {
    return t(
      vm.isPaid
        ? "financial.installmentEdit.paidHelper"
        : "financial.installmentEdit.lockedHelper",
    );
  }

  function renderBody() {
    if (vm.isNotFound) {
      return (
        <ErrorState
          message={t("financial.errors.notFound")}
          onRetry={vm.onClose}
          retryLabel={t("common.actions.close")}
        />
      );
    }

    if (!state || !vm.plan) {
      return <Skeleton.ListItem testID="installment-edit-skeleton" />;
    }

    const isAll = state.scope === "ALL";

    return (
      <View style={styles.form}>
        <RadioGroup
          accessibilityLabel={t("financial.installmentEdit.scope")}
          disabled={vm.isSaving}
          onChange={vm.onScopeChange}
          options={[
            {
              label: t("financial.installmentEdit.onlyThis"),
              value: "ONLY_THIS",
            },
            {
              label: t("financial.installmentEdit.thisAndNext"),
              value: "THIS_AND_NEXT",
            },
            { label: t("financial.installmentEdit.all"), value: "ALL" },
          ]}
          testID={installmentEditTestIds.scope}
          value={state.scope}
        />
        {vm.fields.amount ? (
          <AmountInput
            error={err(vm.errors.amount)}
            label={t(
              isAll
                ? "financial.transactions.form.totalValue"
                : "financial.transactions.form.amount",
            )}
            onChange={vm.onAmountChange}
            testID={installmentEditTestIds.amount}
            tone="expense"
            value={state.amountCents}
          />
        ) : (
          <TextField
            disabled
            helper={lockedHelper()}
            label={t("financial.transactions.form.amount")}
            onChangeText={() => undefined}
            testID={installmentEditTestIds.amount}
            value={formatAmount(state.amountCents, localeTag)}
          />
        )}
        <TextField
          error={err(vm.errors.description)}
          label={t("financial.transactions.form.description")}
          maxLength={200}
          onChangeText={vm.onDescriptionChange}
          testID={installmentEditTestIds.description}
          value={state.description}
        />
        <SelectField
          closeLabel={t("common.actions.close")}
          error={err(vm.errors.categoryId)}
          label={t("financial.transactions.form.category")}
          onChange={vm.onCategoryChange}
          options={vm.categoryOptions}
          sheetTitle={t("financial.transactions.form.category")}
          testID={installmentEditTestIds.category}
          value={state.categoryId}
        />
        <TextField
          disabled={!vm.fields.count}
          error={err(vm.errors.count)}
          helper={vm.fields.count ? undefined : lockedHelper()}
          keyboardType="number-pad"
          label={t("financial.installmentEdit.count")}
          maxLength={2}
          onChangeText={vm.onCountChange}
          testID={installmentEditTestIds.count}
          value={state.count > 0 ? String(state.count) : ""}
        />
        <SelectField
          closeLabel={t("common.actions.close")}
          disabled={!vm.fields.card}
          helper={vm.fields.card ? undefined : lockedHelper()}
          label={t("financial.transactions.form.card")}
          onChange={vm.onCardChange}
          options={vm.cardOptions}
          sheetTitle={t("financial.transactions.form.card")}
          testID={installmentEditTestIds.card}
          value={state.creditCardId}
        />
        <DateField
          disabled={!vm.fields.date}
          label={t("financial.transactions.form.date")}
          onChange={(date) => date && vm.onDateChange(date)}
          testID={installmentEditTestIds.date}
          todayLabel={t("common.date.today")}
          value={state.date}
          yesterdayLabel={t("common.date.yesterday")}
        />
        {vm.isPaid ? (
          <HelperText
            label={t("financial.installmentEdit.paidHelper")}
            testID={installmentEditTestIds.paidHelper}
            type="info"
            visible
          />
        ) : null}
        {vm.formErrorKey ? (
          <HelperText
            label={t(vm.formErrorKey)}
            testID={installmentEditTestIds.formError}
            type="error"
            visible
          />
        ) : null}
        <View style={styles.actions}>
          <Button.Secondary
            fullWidth
            label={t("financial.installmentPlan.see")}
            onPress={vm.onPlanOpen}
            testID={installmentEditTestIds.seePlan}
          />
          <Button.Secondary
            fullWidth
            label={t("financial.refund.ofPurchase")}
            onPress={vm.onRefundPress}
            testID={installmentEditTestIds.refund}
          />
          <Button.Ghost
            label={t("financial.installmentPlan.delete")}
            onPress={vm.onDeletePress}
            testID={installmentPlanTestIds.delete}
            tone="expense"
          />
        </View>
      </View>
    );
  }

  const card = vm.cardOptions.find(
    (option) => option.value === state?.creditCardId,
  );

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          state && vm.plan ? (
            <Button.Primary
              fullWidth
              label={t("financial.installmentEdit.save")}
              loading={vm.isSaving}
              onPress={vm.onSave}
              size="lg"
              testID={installmentEditTestIds.save}
            />
          ) : undefined
        }
        onClose={vm.onClose}
        presentation="inline"
        testID={installmentEditTestIds.sheet}
        title={
          state
            ? t("financial.installment.label", {
                description: state.description,
                k: vm.installmentNumber,
                n: vm.installmentCount,
              })
            : t("financial.installmentEdit.scope")
        }
        visible
      >
        {renderBody()}
      </BottomSheet>
      {vm.isPlanOpen && vm.plan ? (
        <InstallmentPlanSheet
          cardTitle={card?.label}
          onClose={vm.onPlanClose}
          onPrepay={vm.onPrepayPress}
          onUndoPrepayment={vm.onUndoPrepaymentPress}
          plan={vm.plan}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.installmentEdit.save")}
        message={t("financial.installmentEdit.recalcConfirm")}
        onCancel={vm.onRecalcCancel}
        onConfirm={vm.onRecalcConfirm}
        testID={installmentEditTestIds.recalcConfirm}
        title={t("financial.installmentEdit.recalcTitle")}
        visible={vm.isRecalcOpen}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.prepayment.undo")}
        loading={vm.isUndoingPrepayment}
        message={t("financial.prepayment.undoConfirm")}
        onCancel={vm.onUndoPrepaymentCancel}
        onConfirm={vm.onUndoPrepaymentConfirm}
        testID={installmentPlanTestIds.undoPrepaymentConfirm}
        title={t("financial.prepayment.undoTitle")}
        visible={vm.isUndoPrepaymentOpen}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.installmentPlan.delete")}
        loading={vm.isDeleting}
        message={t("financial.installmentPlan.deleteConfirm", {
          n: vm.installmentCount,
        })}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={installmentPlanTestIds.deleteConfirm}
        title={t("financial.installmentPlan.delete")}
        visible={vm.isDeleteOpen}
      />
    </>
  );
}

export { InstallmentEditModal };
export default InstallmentEditModal;
