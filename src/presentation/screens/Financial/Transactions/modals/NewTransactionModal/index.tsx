import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  DateField,
  ErrorState,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import CategoryChips from "./components/CategoryChips";
import CategoryPickerSheet from "./components/CategoryPickerSheet";
import MissingRecordHint from "./components/MissingRecordHint";
import { useNewTransactionViewModel } from "./hooks";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2];

function NewTransactionModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewTransactionViewModel();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
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
            <Skeleton.ListItem key={row} testID={"transaction-form-skeleton"} />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.form}>
        <SegmentedControl
          accessibilityLabel={t("financial.categories.type")}
          onChange={(value) => vm.onTypeChange(value as typeof vm.type)}
          options={vm.typeOptions.map((option) => ({
            label: t(option.labelKey),
            tone: option.value === "EXPENSE" ? "expense" : "income",
            value: option.value,
          }))}
          value={vm.type}
        />
        <AmountInput
          error={err(vm.amountError)}
          label={t("financial.transactions.form.amount")}
          onChange={vm.onAmountChange}
          tone={vm.typeTone}
          value={vm.amountCents}
        />
        <TextField
          error={err(vm.descriptionError)}
          label={t("financial.transactions.form.description")}
          maxLength={200}
          onChangeText={vm.onDescriptionChange}
          placeholder={t("financial.transactions.form.descriptionPlaceholder")}
          value={vm.description}
        />
        {vm.hasNoCategories ? (
          <MissingRecordHint
            actionLabel={t("financial.transactions.form.createCategory")}
            message={t("financial.transactions.form.noCategories")}
            onCreate={vm.onCreateCategoryPress}
          />
        ) : (
          <CategoryChips
            categories={vm.categoryChips}
            error={err(vm.categoryError)}
            label={t("financial.transactions.form.category")}
            moreLabel={t("financial.transactions.form.moreCategories")}
            onMore={vm.onCategoryPickerOpen}
            onSelect={vm.onCategorySelect}
            selected={vm.selectedCategoryId}
          />
        )}
        <View style={styles.row}>
          <View style={styles.field}>
            {vm.hasNoAccounts ? (
              <MissingRecordHint
                actionLabel={t("financial.transactions.form.createAccount")}
                message={t("financial.transactions.form.noAccounts")}
                onCreate={vm.onCreateAccountPress}
              />
            ) : (
              <SelectField
                closeLabel={t("common.actions.close")}
                error={err(vm.accountError)}
                label={t("financial.transactions.form.account")}
                onChange={vm.onAccountChange}
                options={vm.accountOptions.map((option) => ({
                  description: option.descriptionKey
                    ? t(option.descriptionKey)
                    : undefined,
                  label: option.label,
                  value: option.value,
                }))}
                sheetTitle={t("financial.transactions.form.account")}
                value={vm.selectedAccountId}
              />
            )}
          </View>
          <View style={styles.field}>
            <DateField
              error={err(vm.dateError)}
              label={t("financial.transactions.form.date")}
              onChange={(date) => date && vm.onDateChange(date)}
              todayLabel={t("common.date.today")}
              value={vm.date}
              yesterdayLabel={t("common.date.yesterday")}
            />
          </View>
        </View>
        <ChipGroup
          label={t("financial.common.belongsTo")}
          layout={"wrap"}
          mode={"single"}
          onChange={vm.onOwnerChange}
          options={translateChoices(vm.ownerChoices, t)}
          value={vm.ownerId}
        />
        {vm.formErrorKey && (
          <Text.Body tone={"expense"} value={t(vm.formErrorKey)} />
        )}
        {vm.isEditing && (
          <Button.Ghost
            label={t("financial.transactions.delete")}
            onPress={vm.onDeletePress}
            tone={"expense"}
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
            size={"lg"}
          />
        }
        onClose={vm.onClose}
        presentation={"inline"}
        title={t(vm.titleKey)}
        visible
      >
        {renderBody()}
      </BottomSheet>
      {vm.isCategoryPickerOpen && (
        <CategoryPickerSheet
          closeLabel={t("common.actions.close")}
          onClose={vm.onCategoryPickerClose}
          onQueryChange={vm.onCategoryQueryChange}
          onSelect={vm.onCategorySelect}
          query={vm.categoryQuery}
          rows={vm.categoryPickerRows}
          searchPlaceholder={t("common.search.placeholder")}
          selected={vm.selectedCategoryId}
          title={t("financial.transactions.form.chooseCategory")}
        />
      )}
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
        message={""}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        title={t("financial.transactions.deleteTitle")}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewTransactionModal;
