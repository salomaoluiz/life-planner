import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  DateField,
  FormColumns,
  Text,
  TextField,
} from "@components";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import useStyles from "@screens/Financial/ConfirmPayment/styles";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { useConfirmTransferViewModel } from "./hooks";

// Spec 098 FR 7: "Efetivar transferência". Amount out (fixed for a series occurrence), the amount in (required when it
// is unknown; the exchange rate is a shortcut) and each side's day. "Efetivar" waits for the amount in.
function ConfirmTransferModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useConfirmTransferViewModel();
  const { item, state, transfer } = vm;

  if (!item) {
    return null;
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <Button.Secondary
              fullWidth
              label={t("common.actions.cancel")}
              onPress={vm.onClose}
              size="lg"
              testID={transactionsTestIds.confirmPayCancel}
            />
          </View>
          <View style={styles.footerButton}>
            <Button.Primary
              disabled={!vm.canConfirm}
              fullWidth
              label={t("financial.transfers.pay.confirm")}
              loading={vm.isBlocking}
              onPress={vm.onConfirm}
              size="lg"
              testID={transactionsTestIds.confirmPaySubmit}
            />
          </View>
        </View>
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={transactionsTestIds.confirmTransferModal}
      title={t("financial.transfers.pay.title")}
      visible
    >
      <View style={styles.form}>
        {state && transfer ? (
          <FormColumns
            left={
              <>
                <Text.Body value={transfer.description} />
                <Text.Caption
                  tone="secondary"
                  value={t("financial.transfers.pay.hint")}
                />
                <AmountInput
                  currency={transfer.currencyOut ?? DEFAULT_CURRENCY}
                  label={t(
                    vm.isAmountOutFixed
                      ? "financial.transfers.pay.amountOutFixed"
                      : "financial.transfers.pay.amountOut",
                  )}
                  onChange={
                    vm.isAmountOutFixed ? () => undefined : vm.onAmountOutChange
                  }
                  testID={transactionsTestIds.confirmTransferAmountOut}
                  tone="expense"
                  value={state.amountOutCents}
                />
                {vm.sameCurrency ? null : (
                  <>
                    <AmountInput
                      currency={transfer.currencyIn}
                      label={t("financial.transfers.pay.amountIn")}
                      onChange={vm.onAmountInChange}
                      testID={transactionsTestIds.confirmTransferAmountIn}
                      tone="income"
                      value={vm.amountInCents}
                    />
                    <TextField
                      keyboardType="decimal-pad"
                      label={t("financial.transfers.form.rate")}
                      onChangeText={vm.onRateChange}
                      testID={transactionsTestIds.confirmTransferRate}
                      value={state.rateText}
                    />
                  </>
                )}
              </>
            }
            right={
              <>
                <DateField
                  label={t("financial.transfers.form.dateOut")}
                  onChange={vm.onDateOutChange}
                  testID={transactionsTestIds.confirmTransferDateOut}
                  todayLabel={t("common.date.today")}
                  value={state.dateOut}
                  yesterdayLabel={t("common.date.yesterday")}
                />
                <DateField
                  label={t("financial.transfers.form.dateIn")}
                  onChange={vm.onDateInChange}
                  testID={transactionsTestIds.confirmTransferDateIn}
                  todayLabel={t("common.date.today")}
                  value={state.dateIn}
                  yesterdayLabel={t("common.date.yesterday")}
                />
                {vm.errorKey ? (
                  <Text.Body
                    testID={transactionsTestIds.confirmTransferError}
                    tone="expense"
                    value={t(vm.errorKey)}
                  />
                ) : null}
              </>
            }
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

export default ConfirmTransferModal;
