import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface LimitBarProps {
  accessibilityLabel: string;
  /** 0..100, clamped */
  consumedPct: number;
  /** 0..100, clamped; drawn after the consumed share */
  projectedPct: number;
  testID?: string;
}

const HEIGHT = 12;

function clamp(value: number) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

// Spec 096: the card limit in one bar: consumed (solid), projected (light with a dashed edge) and available (empty).
// The values and labels are text next to it, so the bar never carries the meaning by color alone.
function LimitBar(props: LimitBarProps) {
  const { colors, radius } = useKitTheme();
  const consumed = clamp(props.consumedPct);
  const projected = Math.min(clamp(props.projectedPct), 100 - consumed);
  const styles = StyleSheet.create({
    consumed: {
      backgroundColor: colors.accent,
      height: HEIGHT,
      width: `${consumed}%`,
    },
    projected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
      borderStyle: "dashed",
      borderWidth: 1,
      height: HEIGHT,
      width: `${projected}%`,
    },
    track: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.full,
      flexDirection: "row",
      height: HEIGHT,
      overflow: "hidden",
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: 100,
        min: 0,
        now: Math.round(consumed + projected),
      }}
      style={styles.track}
      testID={props.testID}
    >
      <View
        style={styles.consumed}
        testID={props.testID && `${props.testID}-consumed`}
      />
      <View
        style={styles.projected}
        testID={props.testID && `${props.testID}-projected`}
      />
    </View>
  );
}

export default LimitBar;
