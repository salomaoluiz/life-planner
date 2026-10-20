import { View } from "react-native";

import {
  AmountText,
  BottomSheet,
  Button,
  DateField,
  SegmentedControl,
  SelectField,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import invoiceTestIds from "@screens/Financial/Invoice/testIds";

import useStyles from "./styles";

interface Props {
  accountId?: string;
  accountOptions: { label: string; value: string }[];
  amountCents: number;
  currency: CurrencyCode;
  errorKey?: TranslationKeys;
  isPaying: boolean;
  isSubmitDisabled: boolean;
  method: "ACCOUNT" | "EXTERNAL";
  onAccountChange: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onMethodChange: (value: string) => void;
  onPaidOnChange: (date?: Date) => void;
  paidOn: Date;
}

// Pay the whole closed invoice from an app account or by boleto from an account the app doesn't know (spec 029 FR 18-20).
function PayInvoiceSheet(props: Props) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const localeTag = useLocaleTag();
  const hasAccounts = props.accountOptions.length > 0;

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={props.isSubmitDisabled}
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
