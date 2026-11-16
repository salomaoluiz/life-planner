import { useState } from "react";
import { View } from "react-native";

import { BottomSheet, Button, DateField, FormColumns, Text } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";

import { formatDay } from "../models/overviewFormat";
import {
  maxFutureDate,
  monthsInPeriod,
  OverviewPeriod,
  validateCustomPeriod,
} from "../models/overviewPeriod";
import useStyles from "../styles";

interface Props {
  // The message under the end date WHEN the range is refused (default: the finance one)
  errorText?: (maxTo: string) => string;
  // The note under the fields (default: the finance one)
  hint?: string;
  initial: OverviewPeriod;
  // The latest end the date picker offers (default: the finance 24-month limit)
  maxDate?: string;
  onApply: (period: OverviewPeriod) => void;
  onClose: () => void;
  // Prefix of the testIDs (default: financial.overview)
  testIdPrefix?: string;
  today: string;
  // The range rule (default: the finance one)
  validate?: (
    from: string,
    to: string,
    today: string,
  ) => { maxTo: string; ok: false } | { ok: true };
}

// The exact range of the dashboard: the 045 period rule (up to 2 years), an end up to 24 months after the current
// month (spec 053). Two columns on wide layouts (From | To), the compact sheet on phones.
function CustomPeriodSheet(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const wide = useBreakpoint() !== "compact";
  const [from, setFrom] = useState<Date | undefined>(
    toDate(props.initial.from),
  );
  const [to, setTo] = useState<Date | undefined>(toDate(props.initial.to));
  const prefix = props.testIdPrefix ?? "financial.overview";
  const validate = props.validate ?? validateCustomPeriod;
  const validation =
    from && to
      ? validate(toDateKey(from), toDateKey(to), props.today)
      : undefined;

  function apply() {
    if (from && to && validation?.ok) {
      props.onApply({ from: toDateKey(from), to: toDateKey(to) });
    }
  }

  const fromField = (
    <DateField
      label={t("financial.transactions.filters.period.from")}
      maxDate={to}
      onChange={setFrom}
      testID={`${prefix}.custom-from`}
      value={from}
    />
  );
  const toField = (
    <DateField
      label={t("financial.transactions.filters.period.to")}
      maxDate={toDate(props.maxDate ?? maxFutureDate(props.today))}
      minDate={from}
      onChange={setTo}
      testID={`${prefix}.custom-to`}
      value={to}
    />
  );
  const error =
    validation && !validation.ok ? (
      <Text.Caption
        testID={`${prefix}.custom-error`}
        tone="expense"
        value={
          props.errorText?.(validation.maxTo) ??
          t("financial.transactions.filters.period.error", {
            date: validation.maxTo,
          })
        }
      />
    ) : null;
  const hint = (
    <Text.Caption
      tone="secondary"
      value={props.hint ?? t("financial.overview.period.customHint")}
    />
  );

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={!validation?.ok}
          fullWidth
          label={t("financial.overview.period.apply")}
          onPress={apply}
          testID={`${prefix}.custom-apply`}
        />
      }
      footerSecondary={
        wide ? (
          <Button.Secondary
            fullWidth
            label={t("common.actions.cancel")}
            onPress={props.onClose}
            testID={`${prefix}.custom-cancel`}
          />
        ) : undefined
      }
      footerStart={
        wide && from && to && validation?.ok ? (
          <Text.Caption
            tone="secondary"
            value={t("financial.overview.period.customSummary", {
              from: formatDay(toDateKey(from), localeTag),
              months: monthsInPeriod({
                from: toDateKey(from),
                to: toDateKey(to),
              }),
              to: formatDay(toDateKey(to), localeTag),
            })}
          />
        ) : undefined
      }
      onClose={props.onClose}
      size={wide ? "form" : "dialog"}
      testID={`${prefix}.custom-sheet`}
      title={t("financial.overview.period.customTitle")}
      visible
    >
      {wide ? (
        <FormColumns
          left={fromField}
          right={
            <View style={styles.dates}>
              {toField}
              {error}
            </View>
          }
          testID={`${prefix}.custom-sheet`}
        />
      ) : (
        <View style={styles.dates}>
          {fromField}
          {toField}
          {error}
        </View>
      )}
      {hint}
    </BottomSheet>
  );
}

function toDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export default CustomPeriodSheet;
