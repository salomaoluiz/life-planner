import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  DateField,
  ErrorState,
  SelectField,
  SwitchRow,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import investmentTestIds from "@screens/Investment/testIds";

import { FixedIncomeContributionVM } from "../hooks";

const ids = investmentTestIds.modal.contribution;

// "Novo aporte": the small modal of the fixed income detail (spec 105 FR 30).
function Wide({ vm }: AdaptiveViewProps<FixedIncomeContributionVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({ body: { gap: spacing.md } });

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
        <AmountInput
          currency="BRL"
          error={
            vm.amountError
              ? t("investment.fixedIncome.redeem.invalid")
              : undefined
          }
          label={t("investment.fixedIncome.contribution.amount")}
          onChange={vm.onAmountChange}
          testID={ids.amount}
          value={vm.amount}
        />
        <DateField
          label={t("investment.fixedIncome.contribution.date")}
          maxDate={new Date()}
          onChange={vm.onDateChange}
          testID={ids.date}
          value={vm.date}
        />
        <SwitchRow
          label={t("investment.form.operation.generate")}
          onToggle={vm.onGenerateChange}
          testID={ids.generate}
          value={vm.generate}
        />
        {vm.generate ? (
          <SelectField
            closeLabel={t("investment.form.close")}
            label={t("investment.fixedIncome.new.account")}
            onChange={vm.onAccountChange}
            options={vm.accountOptions}
            sheetTitle={t("investment.fixedIncome.new.account")}
            testID={ids.account}
            value={vm.accountId}
          />
        ) : null}
        <Text.Caption
          tone="secondary"
          value={t("investment.fixedIncome.contribution.hint")}
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
          label={t("investment.fixedIncome.contribution.save")}
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
      title={t("investment.fixedIncome.contribution.title")}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
