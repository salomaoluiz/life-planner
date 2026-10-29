import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface TodayMarkerProps {
  /** Distance of the bottom edge of the line from the bottom of the chart */
  bottom: number;
  label: string;
  /** Where the label sits when it should not follow the line start (default: `top`) */
  labelTop?: number;
  testID?: string;
  top: number;
  /** Horizontal position of the line in the chart, in px */
  x: number;
}

// The vertical "Today" line of the Overview charts (spec 053 FR 18): dashed, with its label at the top.
function TodayMarker(props: TodayMarkerProps) {
  const { colors, radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    label: {
      backgroundColor: colors.accentSoft,
      borderRadius: radius.sm,
      left: props.x + spacing.xxs,
      paddingHorizontal: spacing.xs,
      position: "absolute",
      top: props.labelTop ?? props.top,
    },
    line: {
      borderColor: colors.accentText,
      borderLeftWidth: 2,
      borderStyle: "dashed",
      bottom: props.bottom,
      left: props.x,
      position: "absolute",
      top: props.top,
    },
  });

  return (
    <View pointerEvents="none" testID={props.testID}>
      <View style={styles.line} />
      <View style={styles.label}>
        <Text.Caption tone="accent" value={props.label} />
      </View>
    </View>
  );
}

export default TodayMarker;
