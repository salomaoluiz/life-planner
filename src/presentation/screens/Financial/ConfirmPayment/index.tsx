import { View } from "react-native";

import {
  AmountInput,
  AmountText,
  Badge,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  DateField,
  FormColumns,
  Icon,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { useBreakpoint } from "@presentation/theme";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { useConfirmPaymentViewModel } from "./hooks";
import useStyles from "./styles";

// Spec 097: confirms ("Efetivar" / "Receber") an unpaid account row from the list. Two columns on wide screens
// (the open item | value and date), a bottom sheet on mobile.
function ConfirmPaymentModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useBreakpoint() === "compact";
  const vm = useConfirmPaymentViewModel();
  const item = vm.item;

  if (!item) {
    return null;
  }

  const currency = item.currency ?? DEFAULT_CURRENCY;
  const labels = vm.isIncome
    ? ({
        dateLabel: "financial.transactions.confirmPay.dateLabelReceive",
        valueLabel: "financial.transactions.confirmPay.valueLabelReceive",
      } as const)
    : ({
        dateLabel: "financial.transactions.confirmPay.dateLabelPay",
        valueLabel: "financial.transactions.confirmPay.valueLabelPay",
      } as const);
  const transactionDay = formatDay(vm.transactionDate, localeTag);
  const otherDay = vm.otherDate ? formatDay(vm.otherDate, localeTag) : "";
  const choiceLabels = {
    other: vm.otherDate
      ? t("financial.transactions.confirmPay.dateOther", { date: otherDay })
      : t("financial.transactions.confirmPay.dateOtherPick"),
    today: t("common.date.today"),
    transaction: compact
      ? transactionDay
      : t("financial.transactions.confirmPay.dateTransaction", {
          date: transactionDay,
        }),
    yesterday: t("common.date.yesterday"),
  };
  const delta = formatAmount(Math.abs(vm.differenceCents), localeTag, currency);

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
              disabled={!vm.isValid}
              fullWidth
              label={t(
                vm.isIncome
                  ? "financial.transactions.confirmPay.actionReceive"
                  : "financial.transactions.confirmPay.actionPay",
              )}
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
      testID={transactionsTestIds.confirmPayModal}
      title={t(
        vm.isIncome
          ? "financial.transactions.confirmPay.titleReceive"
          : "financial.transactions.confirmPay.titlePay",
        { description: item.description },
      )}
      visible
    >
      <View style={styles.form}>
        <FormColumns
          left={
            <>
              <Text.Caption
                tone="secondary"
                value={t("financial.transactions.confirmPay.open")}
              />
              <Card>
                <View style={styles.itemHead}>
                  <View style={styles.itemHead}>
                    <Text.Body value={item.description} />
                    {item.recurrenceId ? (
                      <Icon name="repeat" size={16} />
                    ) : null}
                  </View>
                  <AmountText
                    currency={currency}
                    type={vm.isIncome ? "INCOME" : "EXPENSE"}
                    value={vm.originalCents}
                  />
                </View>
                <Text.Caption
                  tone="secondary"
                  value={[
                    transactionDay,
                    item.categoryName ?? item.category,
                    item.accountName,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                {vm.overdueDays > 0 ? (
                  <Badge
                    label={t(
                      pluralKey(
                        "financial.transactions.confirmPay.overdue",
                        vm.overdueDays,
                      ),
                      {
                        count: vm.overdueDays,
                      },
                    )}
                    tone="expense"
                  />
                ) : null}
                {item.recurrenceId ? (
                  <Text.Caption
                    tone="secondary"
                    value={t("financial.transactions.confirmPay.seriesNote", {
                      frequency: item.recurrenceFrequency
                        ? t(
                            `financial.recurrence.frequency.${item.recurrenceFrequency}`,
                          )
                        : "",
                      value: formatAmount(
                        vm.originalCents,
                        localeTag,
                        currency,
                      ),
                    })}
                  />
                ) : null}
              </Card>
              <Text.Caption
                tone="secondary"
                value={t("financial.transactions.confirmPay.hint")}
              />
            </>
          }
          right={
            <>
              <AmountInput
                currency={currency}
                error={vm.amountError ? t(vm.amountError) : undefined}
                label={t(labels.valueLabel)}
                onChange={vm.onCentsChange}
                testID={transactionsTestIds.confirmPayValue}
                tone={vm.isIncome ? "income" : "expense"}
                value={vm.cents}
              />
              {vm.differenceCents !== 0 ? (
                <Text.Caption
                  tone="secondary"
                  value={t("financial.transactions.confirmPay.difference", {
                    delta: `${vm.differenceCents > 0 ? "+" : "−"} ${delta}`,
                    original: formatAmount(
                      vm.originalCents,
                      localeTag,
                      currency,
                    ),
                  })}
                />
              ) : null}
              <ChipGroup
                label={t(labels.dateLabel)}
                mode="single"
                onChange={(value) => vm.onChoice(value as typeof vm.choice)}
                options={vm.choices.map((value) => ({
                  label: choiceLabels[value],
                  value,
                }))}
                testID={transactionsTestIds.confirmPayDateGroup}
                value={vm.choice}
              />
              {vm.choice === "other" ? (
                <DateField
                  label={t(labels.dateLabel)}
                  onChange={vm.onOtherDate}
                  testID={transactionsTestIds.confirmPayDatePicker}
                  todayLabel={t("common.date.today")}
                  value={vm.otherDate}
                  yesterdayLabel={t("common.date.yesterday")}
                />
              ) : null}
            </>
          }
        />
      </View>
    </BottomSheet>
  );
}

function formatDay(date: Date, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export { ConfirmPaymentModal };
export default ConfirmPaymentModal;
