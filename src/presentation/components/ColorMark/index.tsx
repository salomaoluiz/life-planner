import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface ColorMarkProps {
  accessibilityLabel?: string;
  /** A data color (`#RRGGBB`) from the caller's palette, not a theme token */
  color: string;
  height?: number;
  shape?: "bar" | "dot";
  testID?: string;
  width?: number;
}

export interface ShareBarProps {
  accessibilityLabel: string;
  color: string;
  /** 0..1, clamped */
  progress: number;
  testID?: string;
}

const DOT = 12;
const BAR_HEIGHT = 6;

// A swatch or a vertical mark in a data color: the class colors of the allocation and the ranking (spec 110).
function ColorMark(props: ColorMarkProps) {
  const { radius } = useKitTheme();
  const dot = (props.shape ?? "dot") === "dot";
  const styles = StyleSheet.create({
    root: {
      backgroundColor: props.color,
      borderRadius: dot ? radius.full : radius.sm,
      height: props.height ?? (dot ? DOT : 32),
      width: props.width ?? (dot ? DOT : 10),
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      style={styles.root}
      testID={props.testID}
    />
  );
}

// The share of the largest asset as a thin bar (ranking rows).
function ShareBar(props: ShareBarProps) {
  const { colors, radius } = useKitTheme();
  const progress = Number.isFinite(props.progress)
    ? Math.min(1, Math.max(0, props.progress))
    : 0;
  const styles = StyleSheet.create({
    fill: {
      backgroundColor: props.color,
      borderRadius: radius.full,
      height: BAR_HEIGHT,
      width: `${Math.round(progress * 100)}%`,
    },
    track: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.full,
      height: BAR_HEIGHT,
      marginTop: 6,
      overflow: "hidden",
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: Math.round(progress * 100) }}
      style={styles.track}
      testID={props.testID}
    >
      <View style={styles.fill} />
    </View>
  );
}

export { ColorMark, ShareBar };
