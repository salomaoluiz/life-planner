import { StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface DonutChartProps {
  accessibilityLabel: string;
  centerLabel?: string;
  centerValue?: string;
  onSelect?: (id: string) => void;
  /** The slice drawn with an accent outline */
  selectedId?: string;
  size?: number;
  /** Each slice is as big as its `value`; a slice without a positive value is not drawn */
  slices: DonutSlice[];
  testID?: string;
}

export interface DonutSlice {
  color: string;
  id: string;
  label: string;
  value: number;
}

const FULL_TURN = Math.PI * 2;
const GAP = 0.012;
const RING_RATIO = 0.18;
const OUTLINE_EXTRA = 5;

// A ring split by value (spec 110 FR 15-16): pressable slices, an accent outline on the selected one and a text in
// the centre. The legend (with the values) is the caller's, so its rows can be real buttons.
function DonutChart(props: DonutChartProps) {
  const { colors, spacing } = useKitTheme();
  const size = props.size ?? 168;
  const ring = size * RING_RATIO;
  const radius = (size - ring) / 2 - OUTLINE_EXTRA / 2;
  const center = size / 2;
  const visible = props.slices.filter((slice) => slice.value > 0);
  const total = visible.reduce((sum, slice) => sum + slice.value, 0);
  const styles = StyleSheet.create({
    center: {
      alignItems: "center",
      bottom: 0,
      gap: spacing.xxs,
      justifyContent: "center",
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    },
    root: { alignSelf: "center", height: size, width: size },
  });
  let angle = -Math.PI / 2;
  const arcs = visible.map((slice) => {
    const sweep = (slice.value / total) * FULL_TURN;
    const arc = { from: angle, slice, to: angle + sweep };

    angle += sweep;

    return arc;
  });

  function point(theta: number) {
    return {
      x: center + radius * Math.cos(theta),
      y: center + radius * Math.sin(theta),
    };
  }

  function arcPath(from: number, to: number) {
    const gap = arcs.length > 1 ? GAP : 0;
    const [start, end] = [point(from + gap), point(to - gap)];
    const large = to - from - gap * 2 > Math.PI ? 1 : 0;

    return `M${start.x} ${start.y} A${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  function renderSlice(arc: (typeof arcs)[number]) {
    const { slice } = arc;
    const common = {
      onPress: () => props.onSelect?.(slice.id),
      stroke: slice.color,
      strokeWidth: ring,
      testID: props.testID && `${props.testID}-slice-${slice.id}`,
    };

    // One slice takes the whole turn: an arc from a point to itself draws nothing, a circle does.
    return arcs.length === 1 ? (
      <Circle
        cx={center}
        cy={center}
        fill="none"
        key={slice.id}
        r={radius}
        {...common}
      />
    ) : (
      <Path
        d={arcPath(arc.from, arc.to)}
        fill="none"
        key={slice.id}
        {...common}
      />
    );
  }

  const selected = arcs.find((arc) => arc.slice.id === props.selectedId);

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessible
      style={styles.root}
      testID={props.testID}
    >
      <Svg height={size} width={size}>
        {arcs.length === 0 ? (
          <Circle
            cx={center}
            cy={center}
            fill="none"
            r={radius}
            stroke={colors.surfaceRaised}
            strokeWidth={ring}
          />
        ) : (
          <G>
            {selected ? (
              <G testID={props.testID && `${props.testID}-selected`}>
                {arcs.length === 1 ? (
                  <Circle
                    cx={center}
                    cy={center}
                    fill="none"
                    r={radius}
                    stroke={colors.accent}
                    strokeWidth={ring + OUTLINE_EXTRA * 2}
                  />
                ) : (
                  <Path
                    d={arcPath(selected.from, selected.to)}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={ring + OUTLINE_EXTRA * 2}
                  />
                )}
              </G>
            ) : null}
            {arcs.map(renderSlice)}
          </G>
        )}
      </Svg>
      <View pointerEvents="none" style={styles.center}>
        {props.centerLabel ? (
          <Text.Caption tone="secondary" value={props.centerLabel} />
        ) : null}
        {props.centerValue ? <Text.Title value={props.centerValue} /> : null}
      </View>
    </View>
  );
}

export default DonutChart;
