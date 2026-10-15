import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface ProgressBarProps {
  accessibilityLabel: string;
  /** 0..1, clamped */
  progress: number;
  testID?: string;
  tone?: "accent" | "expense";
}

const HEIGHT = 8;

function ProgressBar(props: ProgressBarProps) {
  const { colors, radius } = useKitTheme();
  const clamped = Number.isFinite(props.progress)
    ? Math.min(1, Math.max(0, props.progress))
    : 0;
  const percent = Math.round(clamped * 100);
  const styles = StyleSheet.create({
    fill: {
      backgroundColor:
        props.tone === "expense" ? colors.expense : colors.accent,
      borderRadius: radius.full,
      height: HEIGHT,
      width: `${percent}%`,
    },
    track: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.full,
      height: HEIGHT,
      overflow: "hidden",
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: percent }}
      style={styles.track}
      testID={props.testID}
    >
      <View
        style={styles.fill}
        testID={props.testID && `${props.testID}-fill`}
      />
    </View>
  );
}

export default ProgressBar;
