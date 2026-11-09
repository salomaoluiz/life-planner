import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  DateField,
  ErrorState,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import investmentTestIds from "@screens/Investment/testIds";

import { ValuationModalVM } from "../hooks";

const ids = investmentTestIds.modal.valuation;

// The small modal of the design: one row of two fields on every size.
function Wide({ vm }: AdaptiveViewProps<ValuationModalVM>) {
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
        <View style={styles.row}>
          <View style={styles.cell}>
            <DateField
              label={t("investment.form.valuation.date")}
              maxDate={new Date()}
              onChange={vm.onDateChange}
              testID={ids.date}
              value={vm.date}
            />
          </View>
          <View style={styles.cell}>
            <TextField
              error={vm.unitPriceError ? t(vm.unitPriceError) : undefined}
              keyboardType="decimal-pad"
              label={t("investment.form.valuation.unitPrice")}
              onChangeText={vm.onUnitPriceChange}
              testID={ids.unitPrice}
              value={vm.unitPrice}
            />
          </View>
        </View>
        <Text.Caption
          tone="secondary"
          value={t("investment.form.valuation.hint")}
        />
        {vm.positionText ? (
          <Text.Caption
            testID={ids.position}
            tone="secondary"
            value={t("investment.form.valuation.position", vm.positionText)}
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
          label={t("investment.form.valuation.save")}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={ids.save}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="dialog"
      title={t("investment.form.valuation.title")}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
