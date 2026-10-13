import { Text as RNText, StyleSheet, View } from "react-native";

import { getToneColors, Tone } from "@components/utils/tones";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface BadgeProps {
  label: string;
  testID?: string;
  tone?: Tone;
}

function Badge(props: BadgeProps) {
  const { colors, radius, spacing, typography } = useKitTheme();
  const tone = getToneColors(colors)[props.tone ?? "neutral"];
  const styles = StyleSheet.create({
    label: {
      ...typography.caption,
      color: tone.foreground,
      fontFamily: typography.heading.fontFamily,
      fontWeight: typography.heading.fontWeight,
    },
    root: {
      alignSelf: "flex-start",
      backgroundColor: tone.background,
      borderRadius: radius.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
    },
  });

  return (
    <View style={styles.root} testID={props.testID}>
      <RNText
        numberOfLines={1}
        style={styles.label}
        testID={props.testID && `${props.testID}-label`}
      >
        {props.label}
      </RNText>
    </View>
  );
}

export default Badge;
