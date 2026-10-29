import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SegmentedControlProps {
  accessibilityLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  // Called when the already selected segment is pressed again (e.g. to reopen the Custom period sheet)
  onSelectedPress?: (value: string) => void;
  options: { label: string; tone?: SegmentTone; value: string }[];
  testID?: string;
  value: string;
}

type SegmentTone = "accent" | "expense" | "income";

function SegmentedControl(props: SegmentedControlProps) {
  const { colors, isDark, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const toneColors: Record<SegmentTone, string> = {
    accent: colors.accentText,
    expense: colors.expense,
    income: colors.income,
  };
  function selectedColor(tone: SegmentTone = "accent") {
    return isDark && tone === "accent" ? colors.textPrimary : toneColors[tone];
  }
  const styles = StyleSheet.create({
    segment: {
      alignItems: "center",
      borderRadius: radius.sm,
      flexBasis: "auto",
      flexGrow: 1,
      flexShrink: 0,
      justifyContent: "center",
      minHeight: sizes.touchTarget - spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    selected: {
      backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
      // Dark: the raised fill alone barely differs from the track, so the segment gets an edge.
      ...(isDark ? { borderColor: colors.border, borderWidth: 1 } : {}),
      shadowColor: colors.scrim,
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    track: {
      backgroundColor: isDark ? colors.surface : colors.surfaceRaised,
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
      nativeID={testID}
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
            onPress={() =>
              selected
                ? props.onSelectedPress?.(option.value)
                : props.onChange(option.value)
            }
            selected={selected}
            style={[styles.segment, selected && styles.selected]}
            testID={testID && `${testID}-${option.value}`}
          >
            <Text.BodyStrong
              color={
                selected ? selectedColor(option.tone) : colors.textSecondary
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
