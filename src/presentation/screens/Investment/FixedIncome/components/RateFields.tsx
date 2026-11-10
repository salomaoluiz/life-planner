import { StyleSheet, View } from "react-native";

import { Card, SegmentedControl, Text, TextField } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";

import {
  percentText,
  previewEffectiveRate,
  rateFieldsOf,
  RateFormState,
} from "../models/fixedIncome";

interface RateFieldsProps {
  effectiveId: string;
  // `investmentTestIds.modal.<x>.field` builders and the mode control id.
  fieldId: (name: string) => string;
  form: RateFormState;
  invalid?: boolean;
  modeId: string;
  onChange: (form: RateFormState) => void;
}

const LABELS: Record<
  keyof Omit<RateFormState, "mode">,
  (mode: InvestmentFixedIncomeRateMode) => TranslationKeys
> = {
  annualRate: () => "investment.fixedIncome.annualRate",
  cdiPercent: () => "investment.fixedIncome.cdiPercent",
  indexRate: (mode) =>
    mode === InvestmentFixedIncomeRateMode.IPCA_PLUS
      ? "investment.fixedIncome.indexRate.ipca"
      : "investment.fixedIncome.indexRate.cdi",
  spread: () => "investment.fixedIncome.spread",
};

// The mode control, the fields of the mode and the effective rate used (spec 105 FR 6-7, artboards "novo título" and
// "atualizar taxa"): the percentages are typed by the owner, nothing comes from a market series.
function RateFields(props: RateFieldsProps) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    line: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    root: { gap: spacing.md },
  });
  const effective = previewEffectiveRate(props.form);

  return (
    <View style={styles.root}>
      <SegmentedControl
        accessibilityLabel={t("investment.fixedIncome.rateModeLabel")}
        onChange={(mode) =>
          props.onChange({
            ...props.form,
            mode: mode as InvestmentFixedIncomeRateMode,
          })
        }
        options={Object.values(InvestmentFixedIncomeRateMode).map((mode) => ({
          label: t(`investment.fixedIncome.rateMode.${mode}`),
          value: mode,
        }))}
        testID={props.modeId}
        value={props.form.mode}
      />
      {rateFieldsOf(props.form.mode).map((field) => (
        <TextField
          error={
            props.invalid && !props.form[field]
              ? t("investment.fixedIncome.new.invalid")
              : undefined
          }
          key={field}
          keyboardType="decimal-pad"
          label={t(LABELS[field](props.form.mode))}
          onChangeText={(value) =>
            props.onChange({ ...props.form, [field]: value })
          }
          testID={props.fieldId(field)}
          value={props.form[field]}
        />
      ))}
      <Card>
        <View style={styles.line}>
          <Text.Body
            tone="accent"
            value={t("investment.fixedIncome.effectiveRate")}
          />
          <Text.Heading
            tabular
            testID={props.effectiveId}
            tone="accent"
            value={
              effective === null
                ? "—"
                : t("investment.fixedIncome.effectiveRateValue", {
                    rate: percentText(String(effective), localeTag),
                  })
            }
          />
        </View>
      </Card>
    </View>
  );
}

export default RateFields;
