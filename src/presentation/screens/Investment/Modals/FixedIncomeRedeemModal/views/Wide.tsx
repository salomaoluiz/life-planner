import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  DateField,
  ErrorState,
  FormColumns,
  SegmentedControl,
  SelectField,
  StatusBanner,
  SwitchRow,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentFixedIncomeRedemptionKind } from "@domain/entities/investment/enums";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { formatDay, formatMoney } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { FixedIncomeRedeemVM } from "../hooks";

const ids = investmentTestIds.modal.redeem;

// Spec 105 FR 31 / artboard "resgatar": the form on the left, the estimate of the app on the right.
function Wide({ vm }: AdaptiveViewProps<FixedIncomeRedeemVM>) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    body: { gap: spacing.md },
    line: { flexDirection: "row", justifyContent: "space-between" },
    pair: { flexDirection: "row", gap: spacing.sm },
    pairCell: { flex: 1 },
  });
  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }

  function renderEstimate() {
    const { preview } = vm;

    if (!preview) {
      return (
        <Text.Caption
          testID={ids.previewEmpty}
          tone="secondary"
          value={
            vm.isPreviewing
              ? t("investment.fixedIncome.redeem.previewLoading")
              : t("investment.fixedIncome.estimateHint")
          }
        />
      );
    }

    return (
      <View style={styles.body} testID={ids.preview}>
        <Card>
          <View style={styles.body}>
            <View style={styles.line}>
              <Text.Caption
                tone="secondary"
                value={t("investment.fixedIncome.redeem.gross")}
              />
              <Text.Body tabular value={money(preview.gross)} />
            </View>
            <View style={styles.line}>
              <Text.Caption
                tone="secondary"
                value={t("investment.fixedIncome.redeem.ir")}
              />
              <Text.Body
                tabular
                tone="expense"
                value={`− ${money(preview.ir)}`}
              />
            </View>
            <View style={styles.line}>
              <Text.Caption
                tone="secondary"
                value={t("investment.fixedIncome.redeem.iof")}
              />
              <Text.Body tabular value={money(preview.iof)} />
            </View>
            <View style={styles.line}>
              <Text.BodyStrong
                value={t("investment.fixedIncome.redeem.netLine")}
              />
              <Text.BodyStrong tabular value={money(preview.net)} />
            </View>
          </View>
        </Card>
        <Text.Caption
          tone="secondary"
          value={t("investment.fixedIncome.redeem.lotsUsed")}
        />
        <Card>
          <View style={styles.body}>
            {preview.lots.map((lot) => (
              <View key={lot.operationId} style={styles.line}>
                <Text.Body
                  value={t("investment.fixedIncome.redeem.lotUsed", {
                    date: formatDay(lot.date, localeTag),
                  })}
                />
                <Text.Body tabular value={money(lot.principalUsed)} />
              </View>
            ))}
          </View>
        </Card>
        <View style={styles.line}>
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.redeem.remaining")}
          />
          <Text.BodyStrong
            tabular
            testID={ids.remaining}
            value={money(preview.remaining.gross)}
          />
        </View>
      </View>
    );
  }

  function renderBody() {
    if (vm.isNotFound || (!vm.isLoading && !vm.asset?.fixedIncome)) {
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

    const warning = vm.liquidityWarning;
    const tooLarge =
      vm.availableNet === null
        ? undefined
        : t("investment.fixedIncome.redeem.tooLarge", {
            date: formatDay(
              `${vm.date.getFullYear()}-${String(vm.date.getMonth() + 1).padStart(2, "0")}-${String(vm.date.getDate()).padStart(2, "0")}`,
              localeTag,
            ),
            net: money(vm.availableNet),
          });
    const netError =
      tooLarge ??
      (vm.netError ? t("investment.fixedIncome.redeem.invalid") : undefined);

    return (
      <FormColumns
        left={
          <View style={styles.body}>
            <SegmentedControl
              accessibilityLabel={t("investment.fixedIncome.redeem.kind")}
              onChange={vm.onKindChange}
              options={[
                {
                  label: t("investment.fixedIncome.redeem.partial"),
                  value: InvestmentFixedIncomeRedemptionKind.PARTIAL,
                },
                {
                  label: t("investment.fixedIncome.redeem.total"),
                  value: InvestmentFixedIncomeRedemptionKind.TOTAL,
                },
              ]}
              testID={ids.kind}
              value={vm.kind}
            />
            {warning ? (
              <StatusBanner
                icon="alert-outline"
                message={t(
                  `investment.fixedIncome.redeem.liquidityWarning.${warning}`,
                  {
                    date: formatDay(
                      warning === "AT_MATURITY"
                        ? (vm.asset?.fixedIncome?.maturityDate ?? "")
                        : (vm.asset?.fixedIncome?.liquidityDate ?? ""),
                      localeTag,
                    ),
                  },
                )}
                testID={ids.liquidityWarning}
              />
            ) : null}
            <AmountInput
              currency="BRL"
              error={netError}
              label={t("investment.fixedIncome.redeem.net")}
              onChange={vm.onNetChange}
              testID={ids.net}
              value={vm.netCents}
            />
            <View style={styles.pair}>
              <View style={styles.pairCell}>
                <DateField
                  label={t("investment.fixedIncome.redeem.date")}
                  maxDate={new Date()}
                  onChange={vm.onDateChange}
                  testID={ids.date}
                  value={vm.date}
                />
              </View>
            </View>
            <SwitchRow
              label={t("investment.form.operation.generate")}
              onToggle={vm.onGenerateChange}
              testID={ids.generate}
              value={vm.generate}
            />
            {vm.generate ? (
              <SelectField
                closeLabel={t("investment.form.close")}
                label={t("investment.fixedIncome.redeem.account")}
                onChange={vm.onAccountChange}
                options={vm.accountOptions}
                sheetTitle={t("investment.fixedIncome.redeem.account")}
                testID={ids.account}
                value={vm.accountId}
              />
            ) : null}
            {vm.kind === InvestmentFixedIncomeRedemptionKind.TOTAL ? (
              <Text.Caption
                tone="secondary"
                value={t("investment.fixedIncome.redeem.totalHint")}
              />
            ) : null}
            {vm.failure ? (
              <Text.Body
                tone="expense"
                value={t(vm.failure.key, vm.failure.params)}
              />
            ) : null}
          </View>
        }
        right={
          <View style={styles.body}>
            <Text.BodyStrong
              value={t("investment.fixedIncome.redeem.estimate")}
            />
            {renderEstimate()}
          </View>
        }
        testID={ids.columns}
      />
    );
  }

  return (
    <BottomSheet
      closeLabel={t("investment.form.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("investment.fixedIncome.redeem.save")}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={ids.save}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      subtitle={
        vm.asset?.fixedIncome
          ? t("investment.fixedIncome.redeem.subtitle", {
              name: vm.asset.name,
              net: money(vm.asset.fixedIncome.today.net),
            })
          : undefined
      }
      title={t("investment.fixedIncome.redeem.title")}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
