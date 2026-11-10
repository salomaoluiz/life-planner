import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  DateField,
  ErrorState,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import {
  formatDay,
  formatMoney,
  formatPercent,
  formatResult,
  resultTone,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { FixedIncomeAdjustVM } from "../hooks";

const ids = investmentTestIds.modal.adjust;

// "Ajustar pelo extrato" (artboard "atualizar taxa e ajustar pelo extrato"): computed vs statement.
function Wide({ vm }: AdaptiveViewProps<FixedIncomeAdjustVM>) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    body: { gap: spacing.md },
    line: { flexDirection: "row", justifyContent: "space-between" },
  });
  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }

  function renderBody() {
    if (vm.isNotFound) {
      return (
        <ErrorState
          message={t("investment.detail.notFound")}
          onRetry={vm.onClose}
          retryLabel={t("investment.form.close")}
        />
      );
    }

    if (vm.isLoading) {
      return <Skeleton.ListItem />;
    }

    return (
      <View style={styles.body}>
        <Text.Body
          tone="secondary"
          value={t("investment.fixedIncome.adjust.body")}
        />
        <DateField
          label={t("investment.fixedIncome.adjust.date")}
          maxDate={new Date()}
          onChange={vm.onDateChange}
          testID={ids.date}
          value={vm.date}
        />
        <AmountInput
          currency="BRL"
          error={
            vm.grossError
              ? t("investment.fixedIncome.redeem.invalid")
              : undefined
          }
          label={t("investment.fixedIncome.adjust.gross")}
          onChange={vm.onGrossChange}
          testID={ids.gross}
          value={vm.gross}
        />
        {vm.computed !== null ? (
          <Card testID={ids.computed}>
            <View style={styles.body}>
              <View style={styles.line}>
                <Text.Caption
                  tone="secondary"
                  value={t("investment.fixedIncome.adjust.computed", {
                    date: formatDay(vm.dateText, localeTag),
                  })}
                />
                <Text.Body tabular value={money(vm.computed)} />
              </View>
              <View style={styles.line}>
                <Text.Caption
                  tone="secondary"
                  value={t("investment.fixedIncome.adjust.statement")}
                />
                <Text.Body tabular value={money(vm.gross)} />
              </View>
              {vm.difference !== null ? (
                <View style={styles.line}>
                  <Text.BodyStrong
                    value={t("investment.fixedIncome.adjust.difference")}
                  />
                  <Text.BodyStrong
                    tabular
                    testID={ids.difference}
                    tone={resultTone(vm.difference)}
                    value={t("investment.fixedIncome.adjust.differenceValue", {
                      amount: formatResult(vm.difference, "BRL", localeTag),
                      percent: formatPercent(
                        vm.differencePercent ?? 0,
                        localeTag,
                      ),
                    })}
                  />
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}
        <Text.Caption
          tone="secondary"
          value={t("investment.fixedIncome.adjust.hint")}
        />
        {vm.failure ? (
          <Text.Body
            tone="expense"
            value={t(vm.failure.key, vm.failure.params)}
          />
        ) : null}
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("investment.form.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("investment.fixedIncome.adjust.save")}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={ids.save}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="dialog"
      subtitle={vm.asset?.name}
      title={t("investment.fixedIncome.adjust.title")}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
