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
  initial: OverviewPeriod;
  onApply: (period: OverviewPeriod) => void;
  onClose: () => void;
  today: string;
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
  const validation =
    from && to
      ? validateCustomPeriod(toDateKey(from), toDateKey(to), props.today)
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
      testID="financial.overview.custom-from"
      value={from}
    />
  );
  const toField = (
    <DateField
      label={t("financial.transactions.filters.period.to")}
      maxDate={toDate(maxFutureDate(props.today))}
      minDate={from}
      onChange={setTo}
      testID="financial.overview.custom-to"
      value={to}
    />
  );
  const error =
    validation && !validation.ok ? (
      <Text.Caption
        testID="financial.overview.custom-error"
        tone="expense"
        value={t("financial.transactions.filters.period.error", {
          date: validation.maxTo,
        })}
      />
    ) : null;
  const hint = (
    <Text.Caption
      tone="secondary"
      value={t("financial.overview.period.customHint")}
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
          testID="financial.overview.custom-apply"
        />
      }
      footerSecondary={
        wide ? (
          <Button.Secondary
            fullWidth
            label={t("common.actions.cancel")}
            onPress={props.onClose}
            testID="financial.overview.custom-cancel"
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
      testID="financial.overview.custom-sheet"
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
          testID="financial.overview.custom-sheet"
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
