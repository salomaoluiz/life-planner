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
  Switch,
  SwitchRow,
  Text,
  TextField,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatDayMonth } from "@screens/Financial/Cards/models/cardList";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import CategoryChips from "./components/CategoryChips";
import CategoryPickerSheet from "./components/CategoryPickerSheet";
import MissingRecordHint from "./components/MissingRecordHint";
import { useNewTransactionViewModel } from "./hooks";
import useStyles from "./styles";
import transactionFormTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2];

function monthDateOf(month: string) {
  const [year, value] = month.split("-").map(Number);

  return new Date(year, value - 1, 1);
}

function monthName(month: Date, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, { month: "long" }).format(month);
}

function monthYearName(month: Date, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    month: "long",
    year: "numeric",
  }).format(month);
}

function NewTransactionModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewTransactionViewModel();
  const localeTag = useLocaleTag();
  const isCard = vm.payWith === "CARD";

  function renderPreview(installments: NonNullable<typeof vm.installments>) {
    const { first, hasRemainder, others } = installments.preview!;

    if (!hasRemainder) {
      return t("financial.transactions.form.installmentsPreview", {
        n: installments.count,
        value: formatAmount(first, localeTag),
      });
    }

    return `${t("financial.transactions.form.installmentsPreviewFirst", {
      value: formatAmount(first, localeTag),
    })} + ${t("financial.transactions.form.installmentsPreview", {
      n: installments.count - 1,
      value: formatAmount(others, localeTag),
    })}`;
  }

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
        {vm.hasCards ? (
          <SegmentedControl
            accessibilityLabel={t("financial.transactions.form.payWith")}
            onChange={vm.onPayWithChange}
            options={[
              {
                label: t("financial.transactions.form.payWithAccount"),
                value: "ACCOUNT",
              },
              {
                label: t("financial.transactions.form.payWithCard"),
                value: "CARD",
              },
            ]}
            testID={transactionFormTestIds.payWith}
            value={vm.payWith}
          />
        ) : null}
        {isCard ? null : (
          <SegmentedControl
            accessibilityLabel={t("financial.categories.type")}
            onChange={(value) => vm.onTypeChange(value as typeof vm.type)}
            options={vm.typeOptions.map((option) => ({
              label: t(option.labelKey),
              tone: option.value === "EXPENSE" ? "expense" : "income",
              value: option.value,
            }))}
            testID={transactionFormTestIds.type}
            value={vm.type}
          />
        )}
        <AmountInput
          error={err(vm.amountError)}
          label={t(
            vm.installments.enabled
              ? "financial.transactions.form.totalValue"
              : "financial.transactions.form.amount",
          )}
          onChange={vm.onAmountChange}
          testID={transactionFormTestIds.amountInput}
          tone={vm.typeTone}
          value={vm.amountCents}
        />
        <TextField
          error={err(vm.descriptionError)}
          label={t("financial.transactions.form.description")}
          maxLength={200}
          onChangeText={vm.onDescriptionChange}
          placeholder={t("financial.transactions.form.descriptionPlaceholder")}
          testID={transactionFormTestIds.descriptionInput}
          value={vm.description}
        />
        {vm.hasNoCategories ? (
          <MissingRecordHint
            actionLabel={t("financial.transactions.form.createCategory")}
            message={t("financial.transactions.form.noCategories")}
            onCreate={vm.onCreateCategoryPress}
            testID={transactionFormTestIds.missingCategoryHint}
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
        {isCard ? (
          <View style={styles.form}>
            {vm.hasNoCards ? (
              <Text.Caption
                testID={transactionFormTestIds.missingCardHint}
                tone={"secondary"}
                value={t("financial.transactions.form.noCards")}
              />
            ) : (
              <SelectField
                closeLabel={t("common.actions.close")}
                error={err(vm.cardError)}
                label={t("financial.transactions.form.card")}
                onChange={vm.onCardChange}
                options={vm.cardOptions.map((option) => ({
                  description: option.descriptionKey
                    ? t(option.descriptionKey)
                    : undefined,
                  label: option.label,
                  value: option.value,
                }))}
                sheetTitle={t("financial.transactions.form.card")}
                testID={transactionFormTestIds.cardSelect}
                value={vm.selectedCardId}
              />
            )}
            {vm.invoiceHint && vm.invoiceMonthLabelDate ? (
              <Text.Caption
                testID={transactionFormTestIds.invoiceHint}
                tone={"secondary"}
                value={t("financial.transactions.form.invoiceHint", {
                  due: formatDayMonth(vm.invoiceHint.due),
                  month: monthName(vm.invoiceMonthLabelDate, localeTag),
                })}
              />
            ) : null}
            {vm.overLimitCents > 0 ? (
              <Text.Caption
                testID={transactionFormTestIds.overLimit}
                tone={"expense"}
                value={t("financial.transactions.form.overLimit", {
                  amount: formatAmount(vm.overLimitCents, localeTag),
                })}
              />
            ) : null}
            {vm.isInvoicePaid && vm.invoiceMonthLabelDate ? (
              <Text.Caption
                testID={transactionFormTestIds.invoicePaid}
                tone={"expense"}
                value={t("financial.transactions.form.invoicePaid", {
                  month: monthName(vm.invoiceMonthLabelDate, localeTag),
                })}
              />
            ) : null}
          </View>
        ) : null}
        {vm.installments.visible ? (
          <View style={styles.form}>
            <View style={styles.switchRow}>
              <Text.BodyStrong
                value={t("financial.transactions.form.installments")}
              />
              <Switch
                initialStatus={vm.installments.enabled}
                onToggle={vm.onInstallmentsToggle}
                testID={transactionFormTestIds.installmentsSwitch}
              />
            </View>
            {vm.installments.enabled ? (
              <TextField
                error={err(vm.installments.error)}
                helper={t("financial.transactions.form.installmentsRange")}
                keyboardType="number-pad"
                label={t("financial.transactions.form.installmentsCount")}
                maxLength={2}
                onChangeText={vm.onInstallmentsCountChange}
                testID={transactionFormTestIds.installmentsCount}
                value={vm.installments.countText}
              />
            ) : null}
            {vm.installments.preview ? (
              <Text.Caption
                testID={transactionFormTestIds.installmentsPreview}
                tone={"secondary"}
                value={renderPreview(vm.installments)}
              />
            ) : null}
            {vm.installments.range ? (
              <Text.Caption
                testID={transactionFormTestIds.installmentsInvoices}
                tone={"secondary"}
                value={t("financial.transactions.form.installmentsInvoices", {
                  first: monthName(
                    monthDateOf(vm.installments.range.first),
                    localeTag,
                  ),
                  last: monthYearName(
                    monthDateOf(vm.installments.range.last),
                    localeTag,
                  ),
                })}
              />
            ) : null}
          </View>
        ) : null}
        {vm.isEditing && vm.showPaid ? (
          <>
            {isCard ? null : <View style={styles.row}>{accountField}</View>}
            {paidRow}
            <View style={styles.row}>{dateField}</View>
            <Text.Caption tone={"secondary"} value={t(vm.paidHelpKey)} />
          </>
        ) : (
          <>
            <View style={styles.row}>
              {isCard ? null : accountField}
              {dateField}
            </View>
            {vm.showPaid ? (
              <>
                {paidRow}
                <Text.Caption tone={"secondary"} value={t(vm.paidHelpKey)} />
              </>
            ) : null}
          </>
        )}
        <ChipGroup
          label={t("financial.common.belongsTo")}
          layout={"wrap"}
          mode={"single"}
          onChange={vm.onOwnerChange}
          options={translateChoices(vm.ownerChoices, t)}
          testID={transactionFormTestIds.owner}
          value={vm.ownerId}
        />
        {vm.formErrorKey && (
          <Text.Body
            testID={transactionFormTestIds.formError}
            tone={"expense"}
            value={t(vm.formErrorKey)}
          />
        )}
        {vm.canRefund && (
          <Button.Secondary
            fullWidth
            label={t("financial.refund.ofPurchase")}
            onPress={vm.onRefundPress}
            testID={transactionFormTestIds.refundButton}
          />
        )}
        {vm.isEditing && (
          <Button.Ghost
            label={t("financial.transactions.delete")}
            onPress={vm.onDeletePress}
            testID={transactionFormTestIds.deleteButton}
            tone={"expense"}
          />
        )}
      </View>
    );
  }

  const accountField = (
    <View style={styles.field}>
      {vm.hasNoAccounts ? (
        <MissingRecordHint
          actionLabel={t("financial.transactions.form.createAccount")}
          message={t("financial.transactions.form.noAccounts")}
          onCreate={vm.onCreateAccountPress}
          testID={transactionFormTestIds.missingAccountHint}
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
          testID={transactionFormTestIds.accountSelect}
          value={vm.selectedAccountId}
        />
      )}
    </View>
  );
  const dateField = (
    <View style={styles.field}>
      <DateField
        error={err(vm.dateError)}
        label={t(vm.dateLabelKey)}
        onChange={(date) => date && vm.onDateChange(date)}
        testID={transactionFormTestIds.dateField}
        todayLabel={t("common.date.today")}
        value={vm.date}
        yesterdayLabel={t("common.date.yesterday")}
      />
    </View>
  );
  const paidRow = vm.showPaid ? (
    <SwitchRow
      hint={vm.paidHintKey ? t(vm.paidHintKey) : undefined}
      label={t(vm.paidLabelKey)}
      onToggle={vm.onPaidChange}
      testID={transactionFormTestIds.paid}
      value={vm.paid}
    />
  ) : null;

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            disabled={vm.isSaveDisabled}
            fullWidth
            label={t(vm.saveLabelKey)}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size={"lg"}
            testID={transactionFormTestIds.saveButton}
          />
        }
        onClose={vm.onClose}
        presentation={"inline"}
        testID={transactionFormTestIds.sheet}
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
        testID={transactionFormTestIds.deleteDialog}
        title={t("financial.transactions.deleteTitle")}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewTransactionModal;
