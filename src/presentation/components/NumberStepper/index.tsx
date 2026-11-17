import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import Icon from "@components/Icon";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface NumberStepperProps {
  accessibilityLabel: string;
  decreaseLabel: string;
  /** Overrides `<testID>-decrease` */
  decreaseTestID?: string;
  /** Id of the element that explains the error, read with the field */
  describedBy?: string;
  disabled?: boolean;
  error?: boolean;
  increaseLabel: string;
  /** Overrides `<testID>-increase` */
  increaseTestID?: string;
  max: number;
  min: number;
  /** Called with the typed or stepped number; an empty field reports 0 */
  onChange: (value: number) => void;
  testID?: string;
  value: number;
}

const SIZE = 44;
const INPUT_WIDTH = 52;

// "- 2 +": 44 px buttons around a field that also takes typed digits (spec 114).
function NumberStepper(props: NumberStepperProps) {
  const { colors, radius, typography } = useKitTheme();
  const { testID } = props;
  const [text, setText] = useState(String(props.value));

  // An outside change (unit switch, step) replaces what was typed; an empty field keeps showing empty.
  useEffect(() => {
    if (props.value > 0 && Number(text) !== props.value) {
      setText(String(props.value));
    }
  }, [props.value]);

  const styles = StyleSheet.create({
    button: {
      alignItems: "center",
      height: SIZE,
      justifyContent: "center",
      width: SIZE,
    },
    input: {
      ...typography.bodyStrong,
      borderColor: colors.border,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      color: colors.textPrimary,
      fontVariant: ["tabular-nums"],
      height: SIZE,
      textAlign: "center",
      width: INPUT_WIDTH,
    },
    root: {
      alignItems: "center",
      alignSelf: "flex-start",
      borderColor: props.error ? colors.expense : colors.border,
      borderRadius: radius.md,
      borderWidth: props.error ? 2 : 1,
      flexDirection: "row",
      height: SIZE,
      overflow: "hidden",
    },
  });

  function step(delta: number) {
    const next = Math.min(props.max, Math.max(props.min, props.value + delta));

    setText(String(next));
    props.onChange(next);
  }

  function type(raw: string) {
    const digits = raw.replace(/\D/g, "");

    setText(digits);
    props.onChange(digits === "" ? 0 : Number.parseInt(digits, 10));
  }

  const decreaseDisabled = !!props.disabled || props.value <= props.min;
  const increaseDisabled = !!props.disabled || props.value >= props.max;

  return (
    <View style={styles.root}>
      <Touchable
        accessibilityLabel={props.decreaseLabel}
        accessibilityRole="button"
        disabled={decreaseDisabled}
        minTouchTarget={false}
        onPress={() => step(-1)}
        style={styles.button}
        testID={props.decreaseTestID ?? (testID && `${testID}-decrease`)}
      >
        <Icon color={colors.accent} name="minus" size={20} />
      </Touchable>
      <TextInput
        accessibilityLabel={props.accessibilityLabel}
        aria-describedby={props.describedBy}
        editable={!props.disabled}
        inputMode="numeric"
        maxLength={3}
        nativeID={testID}
        onChangeText={type}
        style={styles.input}
        testID={testID}
        value={text}
      />
      <Touchable
        accessibilityLabel={props.increaseLabel}
        accessibilityRole="button"
        disabled={increaseDisabled}
        minTouchTarget={false}
        onPress={() => step(1)}
        style={styles.button}
        testID={props.increaseTestID ?? (testID && `${testID}-increase`)}
      >
        <Icon color={colors.accent} name="plus" size={20} />
      </Touchable>
    </View>
  );
}

export default NumberStepper;
