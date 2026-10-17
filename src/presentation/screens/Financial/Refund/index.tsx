import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ConfirmDialog,
  DateField,
  HelperText,
  SelectField,
  TextField,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatReferenceMonth } from "@screens/Financial/Cards/models/cardList";

import { useRefundViewModel } from "./hooks";
import useStyles from "./styles";
import refundTestIds from "./testIds";

// A card refund: standalone or linked to a purchase or plan; a refund bigger than its invoice leaves a credit for the next one (spec 032 FR 21-28).
function RefundModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = useRefundViewModel();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  const defaultDescription = vm.linkedName
    ? t("financial.refund.defaultDescriptionOf", { purchase: vm.linkedName })
    : t("financial.refund.defaultDescription");

  function renderBody() {
    if (vm.isLoading) {
      return <Skeleton.ListItem testID="refund-skeleton" />;
    }

    return (
      <View style={styles.form}>
        {vm.linked ? (
          <TextField
            disabled
            label={t("financial.refund.linked")}
            onChangeText={() => undefined}
            testID={refundTestIds.linked}
            value={
              vm.linkedIsPlan
                ? t("financial.refund.linkedPlan", { name: vm.linkedName })
                : (vm.linkedName ?? "")
            }
          />
        ) : null}
        <TextField
          error={err(vm.errors.description)}
          label={t("financial.refund.description")}
          maxLength={200}
          onChangeText={vm.onDescriptionChange}
          testID={refundTestIds.description}
          value={vm.description ?? defaultDescription}
        />
        {vm.isLocked ? (
          <TextField
            disabled
            helper={t("financial.errors.invoicePaid")}
            label={t("financial.refund.amount")}
            onChangeText={() => undefined}
            testID={refundTestIds.amount}
            value={formatAmount(vm.amountCents, localeTag)}
          />
        ) : (
          <AmountInput
            error={err(vm.errors.amount)}
            label={t("financial.refund.amount")}
            onChange={vm.onAmountChange}
            testID={refundTestIds.amount}
            tone="income"
            value={vm.amountCents}
          />
        )}
        <DateField
          disabled={vm.isLocked}
          label={t("financial.refund.date")}
          onChange={vm.onDateChange}
          testID={refundTestIds.date}
          todayLabel={t("common.date.today")}
          value={vm.date}
          yesterdayLabel={t("common.date.yesterday")}
        />
        <SelectField
          closeLabel={t("common.actions.close")}
          disabled={vm.isLocked}
          error={err(vm.errors.invoice)}
          label={t("financial.refund.invoice")}
          onChange={vm.onInvoiceChange}
          options={vm.invoices.map((invoice) => ({
            label: t("financial.prepayment.invoiceOption", {
              month: formatReferenceMonth(invoice.month, localeTag),
              status: t(
                `financial.cards.invoice.status.${invoice.status}` as TranslationKeys,
              ),
            }),
            value: invoice.month,
          }))}
          sheetTitle={t("financial.refund.invoice")}
          testID={refundTestIds.invoice}
          value={vm.invoiceMonth}
        />
        {vm.carryCents > 0 && vm.carryMonth ? (
          <HelperText
            label={t("financial.refund.hint", {
              month: formatReferenceMonth(vm.carryMonth, localeTag),
              value: formatAmount(vm.carryCents, localeTag),
            })}
            testID={refundTestIds.hint}
            type="info"
            visible
          />
        ) : null}
        {vm.formErrorKey ? (
          <HelperText
            label={t(vm.formErrorKey)}
            testID={refundTestIds.formError}
            type="error"
            visible
          />
        ) : null}
        {vm.isEdit ? (
          <Button.Ghost
            label={t("financial.refund.delete")}
            onPress={vm.onDeletePress}
            testID={refundTestIds.delete}
            tone="expense"
          />
        ) : null}
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          vm.isLoading ? undefined : (
            <Button.Primary
              fullWidth
              label={t("financial.refund.save")}
              loading={vm.isSaving}
              onPress={() => vm.onSave(defaultDescription)}
              size="lg"
              testID={refundTestIds.save}
            />
          )
        }
        onClose={vm.onClose}
        presentation="inline"
        testID={refundTestIds.sheet}
        title={t("financial.refund.titleCard", {
          card: vm.card?.title ?? "",
        })}
        visible
      >
        {renderBody()}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.refund.delete")}
        loading={vm.isDeleting}
        message={t("financial.refund.deleteConfirm")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={refundTestIds.deleteConfirm}
        title={t("financial.refund.delete")}
        visible={vm.isDeleteOpen}
      />
    </>
  );
}

export { RefundModal };
export default RefundModal;
