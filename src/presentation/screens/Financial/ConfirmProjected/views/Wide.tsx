import { View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  AmountText,
  BottomSheet,
  Button,
  Card,
  DateField,
  FormColumns,
  HelperText,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { formatReferenceMonth } from "@screens/Financial/Cards/models/cardList";

import { ConfirmProjectedVM } from "../hooks";
import useStyles from "../styles";
import confirmProjectedTestIds from "../testIds";

function formatDay(date: Date, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

// Spec 096 FR 18: confirms ("Efetivar") a projected card purchase with the real value and date.
// Two columns on wide screens (the projected item | the charge), a bottom sheet on mobile.
function Wide({ vm }: AdaptiveViewProps<ConfirmProjectedVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();

  function renderBody() {
    if (vm.isLoading) {
      return <Skeleton.ListItem testID="confirm-projected-skeleton" />;
    }

    return (
      <View style={styles.form}>
        <FormColumns
          left={
            <>
              <Text.Caption
                tone="secondary"
                value={t("financial.projected.confirm.itemTitle")}
              />
              <Card testID={confirmProjectedTestIds.item} variant="dashed">
                <View style={styles.itemHead}>
                  <Text.Body value={vm.description} />
                  <AmountText
                    currency={vm.currency}
                    type="EXPENSE"
                    value={vm.projectedCents}
                  />
                </View>
                <Text.Caption
                  tone="secondary"
                  value={`${formatDay(vm.projectedDate, localeTag)} · ${vm.card?.title ?? ""}`}
                />
                {vm.isRecurring ? (
                  <Text.Caption
                    testID={confirmProjectedTestIds.series}
                    tone="secondary"
                    value={t("financial.projected.confirm.seriesNote")}
                  />
                ) : null}
              </Card>
              <Text.Caption
                tone="secondary"
                value={t("financial.projected.confirm.hint")}
              />
            </>
          }
          right={
            <>
              <AmountInput
                currency={vm.currency}
                error={vm.amountError ? t(vm.amountError) : undefined}
                label={t("financial.projected.confirm.charged")}
                onChange={vm.onAmountChange}
                testID={confirmProjectedTestIds.amount}
                tone="expense"
                value={vm.amountCents}
              />
              {vm.differenceCents !== 0 ? (
                <Text.Caption
                  testID={confirmProjectedTestIds.difference}
                  tone="secondary"
                  value={t("financial.projected.confirm.difference", {
                    difference: formatAmount(
                      vm.differenceCents,
                      localeTag,
                      vm.currency,
                    ),
                    projected: formatAmount(
                      vm.projectedCents,
                      localeTag,
                      vm.currency,
                    ),
                  })}
                />
              ) : null}
              <DateField
                label={t("financial.projected.confirm.chargedDate")}
                onChange={vm.onDateChange}
                testID={confirmProjectedTestIds.date}
                todayLabel={t("common.date.today")}
                value={vm.date}
                yesterdayLabel={t("common.date.yesterday")}
              />
              {vm.invoiceMonth ? (
                <Text.Caption
                  testID={confirmProjectedTestIds.invoiceCaption}
                  tone="secondary"
                  value={t("financial.projected.confirm.invoiceCaption", {
                    month: formatReferenceMonth(vm.invoiceMonth, localeTag),
                  })}
                />
              ) : null}
            </>
          }
          testID={confirmProjectedTestIds.sheet}
        />
        {vm.formErrorKey ? (
          <HelperText
            label={t(vm.formErrorKey)}
            testID={confirmProjectedTestIds.formError}
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
        vm.isLoading ? undefined : (
          <Button.Primary
            fullWidth
            label={t("financial.projected.confirm.action")}
            loading={vm.isSaving}
            onPress={vm.onConfirm}
            size="lg"
            testID={confirmProjectedTestIds.confirm}
          />
        )
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={confirmProjectedTestIds.sheet}
      title={t("financial.projected.confirm.title", { name: vm.description })}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
