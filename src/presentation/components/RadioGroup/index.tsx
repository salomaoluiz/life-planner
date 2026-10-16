import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface RadioGroupProps {
  accessibilityLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: { disabled?: boolean; label: string; value: string }[];
  testID?: string;
  // Required choice: exactly one option is always selected.
  value: string;
}

const DOT = 10;
const RING = 20;

function RadioGroup(props: RadioGroupProps) {
  const { colors, radius, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    dot: {
      backgroundColor: colors.accent,
      borderRadius: DOT / 2,
      height: DOT,
      width: DOT,
    },
    group: { gap: spacing.xxs },
    option: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    ring: {
      alignItems: "center",
      borderColor: colors.border,
      borderRadius: RING / 2,
      borderWidth: 2,
      height: RING,
      justifyContent: "center",
      width: RING,
    },
    ringSelected: { borderColor: colors.accent },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="radiogroup"
      nativeID={testID}
      style={styles.group}
      testID={testID}
    >
      {props.options.map((option) => {
        const selected = option.value === props.value;
        const disabled = !!props.disabled || !!option.disabled;

        return (
          <Touchable
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            disabled={disabled}
            focusRadius={radius.sm}
            key={option.value}
            onPress={() => !selected && props.onChange(option.value)}
            selected={selected}
            style={styles.option}
            testID={testID && `${testID}-${option.value}`}
          >
            <View style={[styles.ring, selected && styles.ringSelected]}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <Text.Body
              color={colors.textPrimary}
              testID={testID && `${testID}-${option.value}-label`}
              value={option.label}
            />
          </Touchable>
        );
      })}
    </View>
  );
}

export default RadioGroup;
