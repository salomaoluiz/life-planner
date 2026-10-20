import { View } from "react-native";

import {
  AmountInput,
  AmountText,
  BottomSheet,
  Button,
  DateField,
  ErrorState,
  FormColumns,
  HelperText,
  RadioGroup,
  Switch,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatReferenceMonth } from "@screens/Financial/Cards/models/cardList";

import { usePrepaymentViewModel } from "./hooks";
import useStyles from "./styles";
import prepaymentTestIds from "./testIds";

// Moves every remaining installment of a plan into one open or closed unpaid invoice, with an optional discount (spec 032 FR 11-16).
function PrepaymentModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = usePrepaymentViewModel();

  function renderBody() {
    if (vm.isLoading) {
      return <Skeleton.ListItem testID="prepayment-skeleton" />;
    }

    if (!vm.targetMonth) {
      return (
        <ErrorState
          message={t("financial.prepayment.empty")}
          onRetry={vm.onClose}
          retryLabel={t("common.actions.close")}
        />
      );
    }

    return (
      <View style={styles.form}>
        <FormColumns
          left={
            <>
              <RadioGroup
                accessibilityLabel={t("financial.prepayment.target")}
                disabled={vm.isSaving}
                onChange={vm.onTargetChange}
                options={vm.invoices.map((invoice) => ({
                  label: t("financial.prepayment.invoiceOption", {
                    month: formatReferenceMonth(invoice.month, localeTag),
                    status: t(
                      `financial.cards.invoice.status.${invoice.status}` as TranslationKeys,
                    ),
                  }),
                  value: invoice.month,
                }))}
                testID={prepaymentTestIds.target}
                value={vm.targetMonth}
              />
              {vm.summary ? (
                <View style={styles.summary}>
                  <Text.Body
                    testID={prepaymentTestIds.summary}
                    value={t("financial.prepayment.summary", vm.summary)}
                  />
                  <Text.Caption
                    tone="secondary"
                    value={t("financial.prepayment.total")}
                  />
                  <AmountText
                    currency={vm.currency}
                    size="heading"
                    testID={prepaymentTestIds.total}
                    type="EXPENSE"
                    value={vm.movedCents}
                  />
                </View>
              ) : null}
              {vm.isEmpty ? (
                <HelperText
                  label={t("financial.prepayment.empty")}
                  testID={prepaymentTestIds.empty}
                  type="info"
                  visible
                />
              ) : null}
            </>
          }
          right={
            <>
              <View style={styles.switchRow}>
                <Text.BodyStrong
                  value={t("financial.prepayment.hasDiscount")}
                />
                <Switch
                  initialStatus={vm.hasDiscount}
                  onToggle={vm.onHasDiscountChange}
                  testID={prepaymentTestIds.hasDiscount}
                />
              </View>
              {vm.hasDiscount ? (
                <AmountInput
                  currency={vm.currency}
                  error={vm.errors.discount ? t(vm.errors.discount) : undefined}
                  label={t("financial.prepayment.discount")}
                  onChange={vm.onDiscountChange}
                  testID={prepaymentTestIds.discount}
                  tone="income"
                  value={vm.discountCents}
                />
              ) : null}
              <DateField
                label={t("financial.prepayment.date")}
                onChange={vm.onDateChange}
                testID={prepaymentTestIds.date}
                todayLabel={t("common.date.today")}
                value={vm.date}
                yesterdayLabel={t("common.date.yesterday")}
              />
              {vm.summary ? (
                <Text.Caption
                  testID={prepaymentTestIds.hint}
                  tone="secondary"
                  value={t("financial.prepayment.hint", {
                    month: formatReferenceMonth(vm.targetMonth, localeTag),
                    value: formatAmount(
                      vm.resultingTotalCents,
                      localeTag,
                      vm.currency,
                    ),
                  })}
                />
              ) : null}
            </>
          }
          testID={prepaymentTestIds.sheet}
        />
        {vm.formErrorKey ? (
          <HelperText
            label={t(vm.formErrorKey)}
            testID={prepaymentTestIds.formError}
            type="error"
            visible
          />
        ) : null}
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        vm.targetMonth ? (
          <Button.Primary
            disabled={!vm.summary}
            fullWidth
            label={t("financial.prepayment.confirm")}
            loading={vm.isSaving}
            onPress={vm.onConfirm}
            size="lg"
            testID={prepaymentTestIds.confirm}
          />
        ) : undefined
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={prepaymentTestIds.sheet}
      title={t("financial.prepayment.title", { plan: vm.planDescription })}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export { PrepaymentModal };
export default PrepaymentModal;
