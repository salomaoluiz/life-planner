import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SegmentedControlProps {
  accessibilityLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: { label: string; tone?: SegmentTone; value: string }[];
  testID?: string;
  value: string;
}

type SegmentTone = "accent" | "expense" | "income";

function SegmentedControl(props: SegmentedControlProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const toneColors: Record<SegmentTone, string> = {
    accent: colors.accentText,
    expense: colors.expense,
    income: colors.income,
  };
  const styles = StyleSheet.create({
    segment: {
      alignItems: "center",
      borderRadius: radius.sm,
      flex: 1,
      justifyContent: "center",
      minHeight: sizes.touchTarget - spacing.xs,
    },
    selected: {
      backgroundColor: colors.surface,
      shadowColor: colors.scrim,
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    track: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.md,
      flexDirection: "row",
      gap: spacing.xxs,
      padding: spacing.xxs,
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="tablist"
      style={styles.track}
      testID={testID}
    >
      {props.options.map((option) => {
        const selected = option.value === props.value;
        return (
          <Touchable
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            disabled={props.disabled}
            focusRadius={radius.sm}
            key={option.value}
            minTouchTarget={false}
            onPress={() => !selected && props.onChange(option.value)}
            selected={selected}
            style={[styles.segment, selected && styles.selected]}
            testID={testID && `${testID}-${option.value}`}
          >
            <Text.BodyStrong
              color={
                selected
                  ? toneColors[option.tone ?? "accent"]
                  : colors.textSecondary
              }
              numberOfLines={1}
              testID={testID && `${testID}-${option.value}-label`}
              value={option.label}
            />
          </Touchable>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
