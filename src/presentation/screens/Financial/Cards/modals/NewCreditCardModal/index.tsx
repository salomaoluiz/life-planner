import { View } from "react-native";

import {
  AmountInput,
  AmountText,
  BottomSheet,
  Button,
  ChipGroup,
  ColorSwatchGroup,
  ConfirmDialog,
  CreditCardTile,
  ErrorState,
  FormColumns,
  HelperText,
  SelectField,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useNewCreditCardViewModel } from "./hooks";
import { PaymentAccountOption } from "./models/cardFormState";
import useStyles from "./styles";
import cardFormTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2];

function NewCreditCardModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function paymentAccountLabel(option: PaymentAccountOption) {
    if (option.labelKey) {
      return t(option.labelKey);
    }

    return option.archived
      ? `${option.label} (${t("financial.accounts.archivedLabel")})`
      : (option.label ?? "");
  }
  const vm = useNewCreditCardViewModel();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  function brandLabel() {
    return t(`financial.cards.brand.${vm.brand}` as TranslationKeys);
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

    if (vm.isLoading) {
      return (
        <View>
          {SKELETON_ROWS.map((row) => (
            <Skeleton.ListItem key={row} testID="card-form-skeleton" />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.form}>
        <FormColumns
          compactGap="lg"
          left={
            <>
              <CreditCardTile
                accessibilityLabel={vm.title || t("financial.cardForm.title")}
                available={
                  <AmountText
                    currency={DEFAULT_CURRENCY}
                    value={vm.limitCents}
                  />
                }
                availableLabel={t("financial.cardForm.limit")}
                brandLabel={brandLabel()}
                lastDigits={vm.lastDigits || undefined}
                onPress={() => undefined}
                testID={cardFormTestIds.preview}
                tint={vm.tint}
                title={vm.title || t("financial.cardForm.title")}
              />
              <TextField
                error={err(vm.titleError)}
                label={t("financial.cardForm.title")}
                maxLength={80}
                onChangeText={vm.onTitleChange}
                testID={cardFormTestIds.titleInput}
                value={vm.title}
              />
              <AmountInput
                currency={DEFAULT_CURRENCY}
                error={err(vm.limitError)}
                label={t("financial.cardForm.limit")}
                onChange={vm.onLimitChange}
                testID={cardFormTestIds.limitInput}
                value={vm.limitCents}
              />
              <SelectField
                closeLabel={t("common.actions.close")}
                label={t("financial.cardForm.brand")}
                onChange={vm.onBrandChange}
                options={translateChoices(vm.brandOptions, t)}
                sheetTitle={t("financial.cardForm.brand")}
                testID={cardFormTestIds.brand}
                value={vm.brand}
              />
              <ChipGroup
                label={t("financial.cardForm.owner")}
                layout="wrap"
                mode="single"
                onChange={vm.onOwnerChange}
                options={translateChoices(vm.ownerChoices, t)}
                testID={cardFormTestIds.owner}
                value={vm.ownerId}
              />
            </>
          }
          right={
            <>
              <TextField
                error={err(vm.lastDigitsError)}
                keyboardType="number-pad"
                label={t("financial.cardForm.lastDigits")}
                maxLength={4}
                onChangeText={vm.onLastDigitsChange}
                testID={cardFormTestIds.lastDigitsInput}
                value={vm.lastDigits}
              />
              <ColorSwatchGroup
                label={t("financial.cardForm.color")}
                onChange={vm.onTintChange}
                options={vm.colorOptions.map((option) => ({
                  label: t(option.labelKey),
                  value: option.value,
                }))}
                testID={cardFormTestIds.swatches}
                value={vm.tint}
              />
              <View style={styles.row}>
                <View style={styles.column}>
                  <SelectField
                    closeLabel={t("common.actions.close")}
                    error={err(vm.closingDayError)}
                    label={t("financial.cardForm.closingDay")}
                    onChange={vm.onClosingDayChange}
                    options={translateChoices(vm.dayOptions, t)}
                    placeholder={t("financial.cardForm.pickDay")}
                    sheetTitle={t("financial.cardForm.closingDay")}
                    testID={cardFormTestIds.closingDay}
                    value={vm.closingDay || undefined}
                  />
                </View>
                <View style={styles.column}>
                  <SelectField
                    closeLabel={t("common.actions.close")}
                    error={err(vm.dueDayError)}
                    label={t("financial.cardForm.dueDay")}
                    onChange={vm.onDueDayChange}
                    options={translateChoices(vm.dayOptions, t)}
                    placeholder={t("financial.cardForm.pickDay")}
                    sheetTitle={t("financial.cardForm.dueDay")}
                    testID={cardFormTestIds.dueDay}
                    value={vm.dueDay || undefined}
                  />
                </View>
              </View>
              <SelectField
                closeLabel={t("common.actions.close")}
                helper={t("financial.cardForm.paymentAccountHelper")}
                label={t("financial.cardForm.paymentAccount")}
                onChange={vm.onPaymentAccountChange}
                options={vm.paymentAccountOptions.map((option) => ({
                  label: paymentAccountLabel(option),
                  value: option.value,
                }))}
                sheetTitle={t("financial.cardForm.paymentAccount")}
                testID={cardFormTestIds.paymentAccount}
                value={vm.paymentAccountId}
              />
              <SelectField
                closeLabel={t("common.actions.close")}
                label={t("financial.cardForm.paymentDay")}
                onChange={vm.onPaymentDayChange}
                options={translateChoices(vm.paymentDayOptions, t)}
                sheetTitle={t("financial.cardForm.paymentDay")}
                testID={cardFormTestIds.paymentDay}
                value={vm.paymentDay}
              />
              <View style={styles.helper}>
                <HelperText
                  label={t("financial.cardForm.paymentAfterDue")}
                  testID={cardFormTestIds.paymentAfterDueWarning}
                  type="error"
                  visible={vm.paymentWarning}
                />
                <HelperText
                  label={t("financial.cardForm.lastDayHint")}
                  type="info"
                  visible
                />
              </View>
            </>
          }
          testID={cardFormTestIds.sheet}
        />
        {vm.formErrorKey && (
          <HelperText
            label={t(vm.formErrorKey)}
            testID={cardFormTestIds.formError}
            type="error"
            visible
          />
        )}
        {vm.archiveWarningCount > 0 ? (
          <HelperText
            label={t(
              pluralKey(
                "financial.recurrence.archiveWarning",
                vm.archiveWarningCount,
              ),
              {
                count: vm.archiveWarningCount,
              },
            )}
            testID={cardFormTestIds.archiveWarning}
            type="info"
            visible
          />
        ) : null}
        {vm.isEditing && (
          <Button.Ghost
            label={t(vm.archiveLabelKey)}
            onPress={vm.onArchiveToggle}
            testID={cardFormTestIds.archiveButton}
          />
        )}
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            fullWidth
            label={t(vm.saveLabelKey)}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size="lg"
            testID={cardFormTestIds.saveButton}
          />
        }
        footerStart={
          vm.isEditing && (
            <Button.Ghost
              label={t("financial.cardForm.delete")}
              onPress={vm.onDeletePress}
              testID={cardFormTestIds.deleteButton}
              tone="expense"
            />
          )
        }
        onClose={vm.onClose}
        presentation="inline"
        size="form"
        testID={cardFormTestIds.sheet}
        title={t(vm.titleKey)}
        visible
      >
        {renderBody()}
      </BottomSheet>
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
        loading={vm.isDeleting}
        message={t("financial.cardForm.deleteMessage")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={cardFormTestIds.deleteDialog}
        title={t("financial.cardForm.deleteTitle", vm.deleteTitleParams)}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewCreditCardModal;
