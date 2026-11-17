import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Button, Card, SegmentedControl, Text, TextField } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import useMarketIndexes from "@screens/Investment/hooks/useMarketIndexes";
import { formatDay } from "@screens/Investment/models/format";

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
  spread: () => "investment.fixedIncome.spread",
};

// The mode control, the fields of the mode and the effective rate used (spec 105 FR 6-7, artboards "novo título" and
// "atualizar taxa"): the owner types the percent of the CDI or the spread; the index itself comes from the Central
// Bank (spec 113 FR 23).
function RateFields(props: RateFieldsProps) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    info: { gap: spacing.xs },
    line: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    root: { gap: spacing.md },
  });
  const indexes = useMarketIndexes().data;
  const effective = previewEffectiveRate(props.form, indexes);

  // Spec 113 FR 23: the index is no longer typed; the box says where it comes from and links to Settings.
  function renderInfo() {
    if (props.form.mode === InvestmentFixedIncomeRateMode.PREFIXED) {
      return null;
    }

    const cdi = indexes?.cdi;
    const expected = indexes?.ipca?.expected12m;

    if (props.form.mode === InvestmentFixedIncomeRateMode.IPCA_PLUS) {
      return expected ? (
        <Text.Caption
          testID={props.effectiveId + ".info"}
          tone="secondary"
          value={t("investment.fixedIncome.ipcaInfo", {
            expected: percentText(expected, localeTag),
          })}
        />
      ) : null;
    }

    return (
      <Card variant="dashed">
        <View style={styles.info}>
          <Text.Caption
            testID={props.effectiveId + ".info"}
            tone="secondary"
            value={
              cdi?.annual
                ? t("investment.fixedIncome.cdiInfo", {
                    annual: percentText(cdi.annual, localeTag),
                    date: formatDay(cdi.date, localeTag),
                  })
                : t("investment.fixedIncome.indexMissing")
            }
          />
          <Button.Ghost
            inline
            label={t("investment.fixedIncome.cdiInfoLink")}
            onPress={() => router.push("/investments/settings")}
          />
        </View>
      </Card>
    );
  }

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
      {renderInfo()}
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
        {props.form.mode === InvestmentFixedIncomeRateMode.CDI_PERCENT ? (
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.effectiveFollows")}
          />
        ) : null}
      </Card>
    </View>
  );
}

export default RateFields;
