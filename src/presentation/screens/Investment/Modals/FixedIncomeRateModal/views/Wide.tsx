import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  DateField,
  ErrorState,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import RateFields from "@screens/Investment/FixedIncome/components/RateFields";
import { rateEntry } from "@screens/Investment/FixedIncome/models/fixedIncome";
import { formatDay } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { FixedIncomeRateVM } from "../hooks";

const ids = investmentTestIds.modal.rate;

// "Atualizar taxa" (artboard "atualizar taxa e ajustar pelo extrato"): a new entry from a date, with the history.
function Wide({ vm }: AdaptiveViewProps<FixedIncomeRateVM>) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    body: { gap: spacing.md },
    history: { gap: spacing.xs },
    line: { flexDirection: "row", justifyContent: "space-between" },
  });

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
        <DateField
          label={t("investment.fixedIncome.updateRate.startDate")}
          onChange={vm.onStartDateChange}
          testID={ids.date}
          value={vm.startDate}
        />
        <RateFields
          effectiveId={ids.effective}
          fieldId={ids.field}
          form={vm.form}
          invalid={vm.invalid}
          modeId={ids.mode}
          onChange={vm.onFormChange}
        />
        <View style={styles.history} testID={ids.history}>
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.updateRate.history")}
          />
          {vm.history.map((rate) => {
            const entry = rateEntry(rate, localeTag);

            return (
              <View key={rate.id} style={styles.line}>
                <Text.Body
                  tone="secondary"
                  value={formatDay(rate.startDate, localeTag)}
                />
                <Text.Body
                  tabular
                  tone="secondary"
                  value={t(entry.key, entry.params)}
                />
              </View>
            );
          })}
          <View style={styles.line}>
            <Text.BodyStrong
              value={t("investment.fixedIncome.updateRate.newEntry", {
                date: formatDay(vm.startText, localeTag),
              })}
            />
          </View>
        </View>
        <Text.Caption
          tone="secondary"
          value={t("investment.fixedIncome.updateRate.hint")}
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
          label={t(
            vm.isEditing
              ? "investment.fixedIncome.updateRate.editSave"
              : "investment.fixedIncome.updateRate.save",
          )}
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
      title={t(
        vm.isEditing
          ? "investment.fixedIncome.updateRate.edit"
          : "investment.fixedIncome.updateRate.title",
      )}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
