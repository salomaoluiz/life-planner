import { useState } from "react";
import { View } from "react-native";

import { BottomSheet, Button, DateField, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";

import { OverviewPeriod, validateCustomPeriod } from "../models/overviewPeriod";
import useStyles from "../styles";

interface Props {
  initial: OverviewPeriod;
  onApply: (period: OverviewPeriod) => void;
  onClose: () => void;
  today: string;
}

// The exact range of the dashboard: the 045 period rule (up to 2 years) and never past the end of the current month.
function CustomPeriodSheet(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
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
      onClose={props.onClose}
      size="dialog"
      testID="financial.overview.custom-sheet"
      title={t("financial.overview.period.customTitle")}
      visible
    >
      <View style={styles.dates}>
        <DateField
          label={t("financial.transactions.filters.period.from")}
          maxDate={to}
          onChange={setFrom}
          testID="financial.overview.custom-from"
          value={from}
        />
        <DateField
          label={t("financial.transactions.filters.period.to")}
          minDate={from}
          onChange={setTo}
          testID="financial.overview.custom-to"
          value={to}
        />
        {validation && !validation.ok ? (
          <Text.Caption
            testID="financial.overview.custom-error"
            tone="expense"
            value={t("financial.transactions.filters.period.error", {
              date: validation.maxTo,
            })}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

function toDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export default CustomPeriodSheet;
