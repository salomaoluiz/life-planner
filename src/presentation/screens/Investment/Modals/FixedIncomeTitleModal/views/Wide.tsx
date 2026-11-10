import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  DateField,
  FormColumns,
  SelectField,
  SwitchRow,
  Text,
  TextField,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
} from "@domain/entities/investment/enums";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import RateFields from "@screens/Investment/FixedIncome/components/RateFields";
import { formatMoney } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { FixedIncomeTitleVM } from "../hooks";

const ids = investmentTestIds.modal.fixedIncomeTitle;

// "Novo título de renda fixa" (artboard "novo título"): the title on the left, the rate and the estimate on the right.
function Wide({ vm }: AdaptiveViewProps<FixedIncomeTitleVM>) {
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
  const invalid = t("investment.fixedIncome.new.invalid");
  const grace = vm.liquidity === InvestmentFixedIncomeLiquidity.GRACE_PERIOD;

  function renderEstimate() {
    if (!vm.estimate) {
      return (
        <Text.Caption
          tone="secondary"
          value={
            vm.estimateLoading
              ? t("investment.fixedIncome.estimateLoading")
              : t("investment.fixedIncome.estimateHint")
          }
        />
      );
    }

    const { atMaturity } = vm.estimate;

    return (
      <View style={styles.body} testID={ids.estimateNet}>
        <View style={styles.line}>
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.gross")}
          />
          <Text.Body tabular value={money(atMaturity.gross)} />
        </View>
        <View style={styles.line}>
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.irEstimated")}
          />
          <Text.Body
            tabular
            tone="expense"
            value={`− ${money(atMaturity.ir)}`}
          />
        </View>
        {atMaturity.iof > 0 ? (
          <View style={styles.line}>
            <Text.Caption
              tone="secondary"
              value={t("investment.fixedIncome.iofEstimated")}
            />
            <Text.Body
              tabular
              tone="expense"
              value={`− ${money(atMaturity.iof)}`}
            />
          </View>
        ) : null}
        <View style={styles.line}>
          <Text.BodyStrong value={t("investment.fixedIncome.netEstimated")} />
          <Text.BodyStrong tabular value={money(atMaturity.net)} />
        </View>
        <Text.Caption
          tone="secondary"
          value={t("investment.fixedIncome.estimateHint")}
        />
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("investment.form.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("investment.fixedIncome.new.save")}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={ids.save}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      title={t("investment.fixedIncome.new.title")}
      visible
    >
      <FormColumns
        left={
          <View style={styles.body}>
            <SelectField
              closeLabel={t("investment.form.close")}
              label={t("investment.fixedIncome.productLabel")}
              onChange={vm.onProductChange}
              options={Object.values(InvestmentFixedIncomeProduct).map(
                (value) => ({
                  label: t(`investment.fixedIncome.product.${value}`),
                  value,
                }),
              )}
              sheetTitle={t("investment.fixedIncome.productLabel")}
              testID={ids.product}
              value={vm.product}
            />
            <ChipGroup
              label={t("investment.fixedIncome.new.owner")}
              layout="wrap"
              mode="single"
              onChange={vm.onOwnerChange}
              options={translateChoices(vm.ownerChoices, t)}
              testID={ids.owner}
              value={vm.ownerId}
            />
            <TextField
              error={vm.errors?.name ? invalid : undefined}
              label={t("investment.fixedIncome.new.name")}
              onChangeText={vm.onNameChange}
              testID={ids.name}
              value={vm.name}
            />
            <SwitchRow
              hint={t("investment.fixedIncome.taxExemptHelper")}
              label={t("investment.fixedIncome.taxExempt")}
              onToggle={vm.onTaxExemptChange}
              testID={ids.taxExempt}
              value={vm.taxExempt}
            />
            <View style={styles.pair}>
              <View style={styles.pairCell}>
                <AmountInput
                  currency="BRL"
                  error={vm.errors?.amount ? invalid : undefined}
                  label={t("investment.fixedIncome.new.amount")}
                  onChange={vm.onAmountChange}
                  testID={ids.amount}
                  value={vm.amount}
                />
              </View>
            </View>
            <DateField
              label={t("investment.fixedIncome.new.date")}
              maxDate={new Date()}
              onChange={vm.onDateChange}
              testID={ids.date}
              value={vm.date}
            />
            <SwitchRow
              label={t("investment.fixedIncome.new.generate")}
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
            <DateField
              label={t("investment.fixedIncome.maturity")}
              onChange={vm.onMaturityChange}
              testID={ids.maturity}
              value={vm.maturity}
            />
            {vm.errors?.maturity ? (
              <Text.Caption
                tone="expense"
                value={t("investment.fixedIncome.new.maturityInvalid")}
              />
            ) : null}
            <SelectField
              closeLabel={t("investment.form.close")}
              label={t("investment.fixedIncome.liquidityLabel")}
              onChange={vm.onLiquidityChange}
              options={Object.values(InvestmentFixedIncomeLiquidity).map(
                (value) => ({
                  label: t(`investment.fixedIncome.liquidity.${value}`),
                  value,
                }),
              )}
              sheetTitle={t("investment.fixedIncome.liquidityLabel")}
              testID={ids.liquidity}
              value={vm.liquidity}
            />
            {grace ? (
              <DateField
                label={t("investment.fixedIncome.liquidityDate")}
                onChange={vm.onLiquidityDateChange}
                testID={ids.liquidityDate}
                value={vm.liquidityDate}
              />
            ) : null}
            {vm.errors?.grace ? (
              <Text.Caption tone="expense" value={invalid} />
            ) : null}
          </View>
        }
        right={
          <View style={styles.body}>
            <RateFields
              effectiveId={ids.effective}
              fieldId={ids.field}
              form={vm.rate}
              invalid={vm.errors?.rate}
              modeId={ids.rateMode}
              onChange={vm.onRateChange}
            />
            <Text.Caption
              tone="secondary"
              value={t("investment.fixedIncome.rateHint")}
            />
            <Card testID={ids.estimate}>
              <View style={styles.body}>
                <Text.BodyStrong
                  value={t("investment.fixedIncome.new.estimate")}
                />
                {renderEstimate()}
              </View>
            </Card>
            {vm.failure ? (
              <Text.Body
                tone="expense"
                value={t(vm.failure.key, vm.failure.params)}
              />
            ) : null}
          </View>
        }
        testID={ids.columns}
      />
    </BottomSheet>
  );
}

export default Wide;
