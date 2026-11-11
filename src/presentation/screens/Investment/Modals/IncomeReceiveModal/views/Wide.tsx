import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  DateField,
  ErrorState,
  SelectField,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import investmentTestIds from "@screens/Investment/testIds";

import { IncomeReceiveModalVM } from "../hooks";

const ids = investmentTestIds.modal.incomeReceive;

// 096's "Efetivar" layout: a bottom sheet on mobile, a dialog on web/tablet.
function Wide({ vm }: AdaptiveViewProps<IncomeReceiveModalVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    body: { gap: spacing.md },
    cell: { flex: 1 },
    row: { flexDirection: "row", gap: spacing.sm },
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
        <Text.Caption
          tone="secondary"
          value={t("investment.income.receive.body", {
            asset: vm.assetLabel,
            date: vm.plannedFor,
            type: vm.typeKey ? t(vm.typeKey) : "",
          })}
        />
        <View style={styles.row}>
          <Text.Body value={t("investment.income.receive.planned")} />
          <Text.BodyStrong tabular value={vm.planned} />
        </View>
        <AmountInput
          currency={vm.currency as CurrencyCode}
          label={t("investment.income.receive.netReceived")}
          onChange={vm.onNetChange}
          testID={ids.netAmount}
          tone="income"
          value={vm.net}
        />
        <Text.Caption
          tone="secondary"
          value={t("investment.income.receive.hint")}
        />
        <View style={styles.row}>
          <View style={styles.cell}>
            <DateField
              label={t("investment.income.receivedOn")}
              onChange={vm.onReceivedOnChange}
              testID={ids.receivedOn}
              value={vm.receivedOn}
            />
          </View>
          <View style={styles.cell}>
            <SelectField
              closeLabel={t("investment.form.close")}
              label={t("investment.income.receive.account")}
              onChange={vm.onAccountChange}
              options={vm.accountOptions}
              sheetTitle={t("investment.income.receive.account")}
              testID={ids.account}
              value={vm.accountId}
            />
          </View>
        </View>
        {vm.showGross ? (
          <Text.Caption
            tone="secondary"
            value={t("investment.income.estimate", {
              gross: vm.gross,
              rate: vm.grossRate,
            })}
          />
        ) : null}
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
          label={t("investment.income.receive.save")}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={ids.save}
        />
      }
      footerStart={
        <Button.Ghost
          label={t("investment.income.receive.delete")}
          onPress={vm.onDelete}
          testID={ids.delete}
          tone="expense"
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="dialog"
      title={t("investment.income.receive.title")}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
