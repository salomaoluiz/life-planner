import { StyleSheet, View } from "react-native";

import { Card, ChipGroup, NumberStepper, Text } from "@components";
import {
  RECURRENCE_INTERVAL_MAX,
  RECURRENCE_UNITS,
  RecurrenceFrequency,
  RecurrenceUnit,
} from "@domain/entities/financial/RecurrenceEntity";
import { useTranslation } from "@presentation/i18n";

import useRecurrenceBlockViewModel from "./useRecurrenceBlockViewModel";

export interface RecurrenceBlockProps {
  /** Rendered between the hint and the preview (the end date field) */
  children?: React.ReactNode;
  /** Locked scopes show the block read-only */
  disabled?: boolean;
  endDate?: Date;
  frequency: RecurrenceFrequency;
  onChange: (frequency: RecurrenceFrequency) => void;
  startDate: Date;
  testIDs: RecurrenceBlockTestIds;
}

export interface RecurrenceBlockTestIds {
  error: string;
  interval: string;
  intervalDecrease: string;
  intervalIncrease: string;
  preview: string;
  unit: string;
}

// "Repeat every [- 2 +] months" with the four unit chips, shared by the transaction and transfer forms (spec 114).
function RecurrenceBlock(props: RecurrenceBlockProps) {
  const { t } = useTranslation();
  const vm = useRecurrenceBlockViewModel(props);
  const { testIDs } = props;
  const styles = StyleSheet.create({
    column: { gap: 12 },
    row: { alignItems: "center", flexDirection: "row", gap: 12 },
  });

  return (
    <Card>
      <View style={styles.column}>
        <Text.Caption value={t("financial.recurrence.repeatEvery")} />
        <View style={styles.row}>
          <NumberStepper
            accessibilityLabel={t("financial.recurrence.repeatEvery")}
            decreaseLabel={t("financial.recurrence.decrease")}
            decreaseTestID={testIDs.intervalDecrease}
            describedBy={vm.error ? testIDs.error : undefined}
            disabled={props.disabled}
            error={!vm.isValid}
            increaseLabel={t("financial.recurrence.increase")}
            increaseTestID={testIDs.intervalIncrease}
            max={RECURRENCE_INTERVAL_MAX[props.frequency.unit]}
            min={1}
            onChange={vm.onIntervalChange}
            testID={testIDs.interval}
            value={props.frequency.interval}
          />
          <Text.Body tone="secondary" value={vm.unitWord} />
        </View>
        <ChipGroup
          disabled={props.disabled}
          layout="wrap"
          mode="single"
          onChange={(value) => vm.onUnitChange(value as RecurrenceUnit)}
          options={RECURRENCE_UNITS.map((unit) => ({
            label: t(`financial.recurrence.unitChip.${unit}`),
            testID: `${testIDs.unit}.${unit}`,
            value: unit,
          }))}
          testID={testIDs.unit}
          value={props.frequency.unit}
        />
        {vm.error ? (
          <Text.Caption
            accessibilityLiveRegion="polite"
            testID={testIDs.error}
            tone="expense"
            value={vm.error}
          />
        ) : (
          <Text.Caption tone="secondary" value={vm.hint} />
        )}
        {props.children}
        {vm.preview ? (
          <Text.Caption
            testID={testIDs.preview}
            tone="secondary"
            value={vm.preview}
          />
        ) : null}
      </View>
    </Card>
  );
}

export default RecurrenceBlock;
