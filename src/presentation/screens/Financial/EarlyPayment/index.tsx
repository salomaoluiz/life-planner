import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ConfirmDialog,
  DateField,
  HelperText,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatReferenceMonth } from "@screens/Financial/Cards/models/cardList";

import { useEarlyPaymentViewModel } from "./hooks";
import useStyles from "./styles";
import earlyPaymentTestIds from "./testIds";

// Pays part (or all) of an open or closed unpaid invoice before the Pay flow, from an account or by boleto (spec 032 FR 29-40).
function EarlyPaymentModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = useEarlyPaymentViewModel();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  const defaultDescription = t("financial.earlyPayment.defaultDescription");

  function renderBody() {
    if (vm.isLoading) {
      return <Skeleton.ListItem testID="early-payment-skeleton" />;
    }

    return (
      <View style={styles.form}>
        <SelectField
          closeLabel={t("common.actions.close")}
          disabled={vm.isLocked}
          label={t("financial.earlyPayment.invoice")}
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
          sheetTitle={t("financial.earlyPayment.invoice")}
          testID={earlyPaymentTestIds.invoice}
          value={vm.invoiceMonth}
        />
        <Text.Body
          testID={earlyPaymentTestIds.leftToPay}
          value={`${t("financial.earlyPayment.leftToPay")}: ${formatAmount(vm.leftCents, localeTag)}`}
        />
        {vm.isLocked ? (
          <TextField
            disabled
            helper={t("financial.errors.invoicePaid")}
            label={t("financial.earlyPayment.amount")}
            onChangeText={() => undefined}
            testID={earlyPaymentTestIds.amount}
            value={formatAmount(vm.amountCents, localeTag)}
          />
        ) : (
          <AmountInput
            error={err(vm.errors.amount)}
            label={t("financial.earlyPayment.amount")}
            onChange={vm.onAmountChange}
            testID={earlyPaymentTestIds.amount}
            tone="income"
            value={vm.amountCents}
          />
        )}
        <DateField
          disabled={vm.isLocked}
          error={err(vm.errors.date)}
          label={t("financial.earlyPayment.date")}
          maxDate={new Date()}
          onChange={vm.onDateChange}
          testID={earlyPaymentTestIds.date}
          todayLabel={t("common.date.today")}
          value={vm.date}
          yesterdayLabel={t("common.date.yesterday")}
        />
        <Text.BodyStrong value={t("financial.earlyPayment.paidFrom")} />
        <SegmentedControl
          accessibilityLabel={t("financial.earlyPayment.paidFrom")}
          onChange={vm.onMethodChange}
          options={[
            { label: t("financial.earlyPayment.account"), value: "ACCOUNT" },
            { label: t("financial.earlyPayment.boleto"), value: "EXTERNAL" },
          ]}
          testID={earlyPaymentTestIds.method}
          value={vm.method}
        />
        {vm.method === "ACCOUNT" && vm.accountOptions.length === 0 ? (
          <Text.Caption
            tone="secondary"
            value={t("financial.earlyPayment.noAccounts")}
          />
        ) : null}
        {vm.method === "ACCOUNT" && vm.accountOptions.length > 0 ? (
          <SelectField
            closeLabel={t("common.actions.close")}
            disabled={vm.isLocked}
            error={err(vm.errors.account)}
            label={t("financial.earlyPayment.account")}
            onChange={vm.onAccountChange}
            options={vm.accountOptions}
            sheetTitle={t("financial.earlyPayment.account")}
            testID={earlyPaymentTestIds.account}
            value={vm.accountId}
          />
        ) : null}
        <TextField
          error={err(vm.errors.description)}
          label={t("financial.earlyPayment.description")}
          maxLength={200}
          onChangeText={vm.onDescriptionChange}
          testID={earlyPaymentTestIds.description}
          value={vm.description ?? defaultDescription}
        />
        {vm.invoiceMonth && !vm.isLocked ? (
          <Text.Caption
            testID={earlyPaymentTestIds.hint}
            tone="secondary"
            value={t("financial.earlyPayment.hint", {
              month: formatReferenceMonth(vm.invoiceMonth, localeTag),
              value: formatAmount(vm.remainingCents, localeTag),
            })}
          />
        ) : null}
        {vm.formErrorKey ? (
          <HelperText
            label={t(vm.formErrorKey)}
            testID={earlyPaymentTestIds.formError}
            type="error"
            visible
          />
        ) : null}
        {vm.isEdit ? (
          <Button.Ghost
            label={t("financial.earlyPayment.delete")}
            onPress={vm.onDeletePress}
            testID={earlyPaymentTestIds.delete}
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
              label={t("financial.earlyPayment.save")}
              loading={vm.isSaving}
              onPress={() => vm.onSave(defaultDescription)}
              size="lg"
              testID={earlyPaymentTestIds.save}
            />
          )
        }
        onClose={vm.onClose}
        presentation="inline"
        testID={earlyPaymentTestIds.sheet}
        title={t("financial.earlyPayment.titleCard", {
          card: vm.card?.title ?? "",
        })}
        visible
      >
        {renderBody()}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.earlyPayment.delete")}
        loading={vm.isDeleting}
        message={t("financial.earlyPayment.deleteConfirm")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={earlyPaymentTestIds.deleteConfirm}
        title={t("financial.earlyPayment.delete")}
        visible={vm.isDeleteOpen}
      />
    </>
  );
}

export { EarlyPaymentModal };
export default EarlyPaymentModal;
