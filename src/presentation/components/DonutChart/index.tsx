import { StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface DonutChartProps {
  accessibilityLabel: string;
  /** Small line above the total, or the selected class name (spec 110) */
  centerLabel: string;
  centerValue: string;
  size?: number;
  slices: DonutSlice[];
  testID?: string;
}

export interface DonutSlice {
  /** 0..1 share of the whole; the slices are normalised together */
  share: number;
  /** A data color (`#RRGGBB`) from the palette of the caller */
  swatch: string;
  testID?: string;
}

const STROKE = 22;
const VIEW = 160;
const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Slices of a whole, drawn as one dashed arc per slice (spec 110 allocation block).
function DonutChart(props: DonutChartProps) {
  const { colors } = useKitTheme();
  const size = props.size ?? 200;
  const total = props.slices.reduce(
    (sum, slice) => sum + Math.max(slice.share, 0),
    0,
  );
  let offset = 0;
  const styles = StyleSheet.create({
    center: {
      alignItems: "center",
      bottom: 0,
      justifyContent: "center",
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    },
    root: { alignItems: "center", height: size, justifyContent: "center" },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="image"
      style={styles.root}
      testID={props.testID}
    >
      <Svg height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} width={size}>
        <G fill="none" strokeWidth={STROKE}>
          <Circle
            cx={VIEW / 2}
            cy={VIEW / 2}
            r={RADIUS}
            stroke={colors.surfaceRaised}
          />
          {props.slices.map((slice, index) => {
            const length =
              total === 0
                ? 0
                : (Math.max(slice.share, 0) / total) * CIRCUMFERENCE;
            const dash = `${length} ${CIRCUMFERENCE - length}`;
            const circle = (
              <Circle
                cx={VIEW / 2}
                cy={VIEW / 2}
                key={`${slice.testID ?? index}`}
                r={RADIUS}
                stroke={slice.swatch}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                testID={slice.testID}
                transform={`rotate(-90 ${VIEW / 2} ${VIEW / 2})`}
              />
            );

            offset += length;

            return circle;
          })}
        </G>
      </Svg>
      <View pointerEvents="none" style={styles.center}>
        <Text.Caption tone="secondary" value={props.centerLabel} />
        <Text.BodyStrong value={props.centerValue} />
      </View>
    </View>
  );
}

export default DonutChart;
