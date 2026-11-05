import { View } from "react-native";

import {
  AmountText,
  BottomSheet,
  Button,
  DateField,
  ListItem,
  SegmentedControl,
  SelectField,
  StatusBanner,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import invoiceTestIds from "@screens/Financial/Invoice/testIds";
import { InvoicePurchaseUIModel } from "@screens/Financial/Transactions/models/CardInvoiceUIModel";

import useStyles from "./styles";

interface Props {
  accountId?: string;
  accountOptions: { label: string; value: string }[];
  amountCents: number;
  currency: CurrencyCode;
  errorKey?: TranslationKeys;
  isPaying: boolean;
  isResolving: boolean;
  isSubmitDisabled: boolean;
  method: "ACCOUNT" | "EXTERNAL";
  // The month a projected purchase can be moved to, already formatted ("December").
  nextMonthLabel: string;
  onAccountChange: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onConfirmProjected: (purchase: InvoicePurchaseUIModel) => void;
  onDiscardProjected: (purchase: InvoicePurchaseUIModel) => void;
  onMethodChange: (value: string) => void;
  onMoveProjected: (purchase: InvoicePurchaseUIModel) => void;
  onPaidOnChange: (date?: Date) => void;
  paidOn: Date;
  // Spec 096 FR 19: projected purchases that still block the payment.
  projected: InvoicePurchaseUIModel[];
}

// Pay the whole closed invoice from an app account or by boleto from an account the app doesn't know (spec 029 FR 18-20).
function PayInvoiceSheet(props: Props) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const localeTag = useLocaleTag();
  const hasAccounts = props.accountOptions.length > 0;
  const blocked = props.projected.length > 0;

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={props.isSubmitDisabled || blocked}
          fullWidth
          label={t("financial.invoice.payment.confirm")}
          loading={props.isPaying}
          onPress={props.onConfirm}
          size="lg"
          testID={invoiceTestIds.payConfirm}
        />
      }
      onClose={props.onClose}
      testID={invoiceTestIds.paySheet}
      title={t("financial.invoice.payment.title", {
        amount: formatAmount(props.amountCents, localeTag, props.currency),
      })}
      visible
    >
      <View style={styles.form}>
        {blocked ? (
          <>
            <StatusBanner
              message={t("financial.projected.pay.warning")}
              testID={invoiceTestIds.payWarning}
            />
            {props.projected.map((purchase) => (
              <View key={purchase.id} testID={invoiceTestIds.payProjected}>
                <ListItem
                  inset
                  title={
                    purchase.recurrenceId
                      ? `${purchase.description} ↻`
                      : purchase.description
                  }
                  trailing={
                    <AmountText
                      currency={props.currency}
                      type="EXPENSE"
                      value={purchase.amountCents}
                    />
                  }
                />
                <View style={styles.actions}>
                  <Button.Secondary
                    disabled={props.isResolving}
                    label={t("financial.projected.confirm.action")}
                    onPress={() => props.onConfirmProjected(purchase)}
                    testID={invoiceTestIds.payProjectedConfirm}
                  />
                  <Button.Secondary
                    disabled={props.isResolving}
                    label={t("financial.projected.pay.move", {
                      month: props.nextMonthLabel,
                    })}
                    onPress={() => props.onMoveProjected(purchase)}
                    testID={invoiceTestIds.payProjectedMove}
                  />
                  <Button.Ghost
                    disabled={props.isResolving}
                    label={t("financial.projected.pay.discard")}
                    onPress={() => props.onDiscardProjected(purchase)}
                    testID={invoiceTestIds.payProjectedDiscard}
                    tone="expense"
                  />
                </View>
              </View>
            ))}
            <Text.Caption
              testID={invoiceTestIds.payRemaining}
              tone="secondary"
              value={t("financial.projected.pay.remaining", {
                count: props.projected.length,
              })}
            />
          </>
        ) : null}
        <AmountText
          currency={props.currency}
          size="heading"
          type="EXPENSE"
          value={props.amountCents}
        />
        <SegmentedControl
          accessibilityLabel={t("financial.invoice.payInvoice")}
          onChange={props.onMethodChange}
          options={[
            {
              label: t("financial.invoice.payment.methodAccount"),
              value: "ACCOUNT",
            },
            {
              label: t("financial.invoice.payment.methodExternal"),
              value: "EXTERNAL",
            },
          ]}
          testID={invoiceTestIds.payMethod}
          value={props.method}
        />
        {props.method === "ACCOUNT" && !hasAccounts ? (
          <Text.Caption
            tone="secondary"
            value={t("financial.invoice.payment.noAccounts")}
          />
        ) : null}
        {props.method === "ACCOUNT" && hasAccounts ? (
          <SelectField
            closeLabel={t("common.actions.close")}
            label={t("financial.invoice.payment.account")}
            onChange={props.onAccountChange}
            options={props.accountOptions}
            sheetTitle={t("financial.invoice.payment.account")}
            testID={invoiceTestIds.payAccount}
            value={props.accountId}
          />
        ) : null}
        <DateField
          label={t("financial.invoice.payment.paidOn")}
          onChange={props.onPaidOnChange}
          testID={invoiceTestIds.payDate}
          todayLabel={t("common.date.today")}
          value={props.paidOn}
          yesterdayLabel={t("common.date.yesterday")}
        />
        {props.errorKey ? (
          <Text.Body
            testID={invoiceTestIds.formError}
            tone="expense"
            value={t(props.errorKey)}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

export default PayInvoiceSheet;
