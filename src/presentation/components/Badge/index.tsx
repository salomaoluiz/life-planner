import { Text as RNText, StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import { getToneColors, Tone } from "@components/utils/tones";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface BadgeProps {
  /** Drawn before the label in the tone colour (the favorite star, spec 094) */
  icon?: string;
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
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: tone.background,
      borderRadius: radius.full,
      flexDirection: "row",
      gap: spacing.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
    },
  });

  return (
    <View style={styles.root} testID={props.testID}>
      {props.icon ? (
        <Icon
          color={tone.foreground}
          name={props.icon}
          size={typography.caption.fontSize}
          testID={props.testID && `${props.testID}-icon`}
        />
      ) : null}
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
