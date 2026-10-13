import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";

import FieldShell from "@components/FieldShell";
import Icon, { IconButton } from "@components/Icon";
import Text from "@components/Text";
import { getFrameStyle } from "@components/TextField/styles";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag } from "@presentation/i18n";

import { getRelativeDay } from "./getRelativeDay";

export interface DateFieldProps {
  clearable?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  error?: string;
  label: string;
  maxDate?: Date;
  minDate?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  saveLabel?: string;
  testID?: string;
  todayLabel?: string;
  value?: Date;
  yesterdayLabel?: string;
}

function DateField(props: DateFieldProps) {
  const theme = useKitTheme();
  const { colors, spacing } = theme;
  const localeTag = useLocaleTag();
  const [open, setOpen] = useState(false);
  const { testID } = props;

  const valid =
    props.value && !Number.isNaN(props.value.getTime())
      ? props.value
      : undefined;
  const relative = valid ? getRelativeDay(valid, new Date()) : undefined;
  const relativeLabels = {
    today: props.todayLabel,
    yesterday: props.yesterdayLabel,
  };
  const relativeLabel = relative ? relativeLabels[relative] : undefined;
  const formatted = valid
    ? new Intl.DateTimeFormat(localeTag, { dateStyle: "medium" }).format(valid)
    : (props.placeholder ?? "");

  const styles = StyleSheet.create({
    frame: {
      ...getFrameStyle({
        disabled: props.disabled,
        error: !!props.error,
        theme,
      }),
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    text: { flex: 1 },
  });

  return (
    <FieldShell
      disabled={props.disabled}
      error={props.error}
      label={props.label}
      testID={testID}
    >
      <View style={styles.frame}>
        <Touchable
          accessibilityLabel={`${props.label}, ${formatted}`}
          accessibilityRole="button"
          disabled={props.disabled}
          onPress={() => setOpen(true)}
          style={styles.text}
          testID={testID}
        >
          <View>
            <Text.Body
              testID={testID && `${testID}-value`}
              tone={valid ? "primary" : "secondary"}
              value={formatted}
            />
          </View>
        </Touchable>
        {relativeLabel ? (
          <Text.Caption
            testID={testID && `${testID}-relative`}
            value={relativeLabel}
          />
        ) : null}
        {props.clearable && valid && props.clearLabel ? (
          <IconButton
            accessibilityLabel={props.clearLabel}
            name="close-circle"
            onPress={() => props.onChange(undefined)}
            testID={testID && `${testID}-clear`}
            variant="plain"
          />
        ) : null}
        <Icon
          color={colors.textSecondary}
          name="calendar-outline"
          size={theme.sizes.iconMd}
        />
      </View>
      <DatePickerModal
        date={valid}
        locale={localeTag}
        mode="single"
        onConfirm={({ date }) => {
          setOpen(false);
          props.onChange(date ?? undefined);
        }}
        onDismiss={() => setOpen(false)}
        saveLabel={props.saveLabel}
        // @ts-expect-error DatePickerModal types omit testID (jest mock is a View)
        testID={testID && `${testID}-picker`}
        validRange={
          props.minDate || props.maxDate
            ? { endDate: props.maxDate, startDate: props.minDate }
            : undefined
        }
        visible={open}
      />
    </FieldShell>
  );
}

export default DateField;
