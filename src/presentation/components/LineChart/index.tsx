import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";

import { useKitTheme } from "@components/utils/useKitTheme";

import { niceTicks, scaleY, toPath } from "./chartScale";

export interface LineChartPoint {
  /** Read by screen readers instead of the axis label (which may be empty for repeated labels) */
  accessibilityLabel?: string;
  label: string;
  projected: boolean;
  value: number;
}

export interface LineChartProps {
  accessibilityLabel: string;
  formatTick: (value: number) => string;
  formatValue: (value: number) => string;
  height?: number;
  /** Labels are skipped to keep this many at most */
  maxLabels?: number;
  onSelect?: (index: number) => void;
  points: LineChartPoint[];
  selectedIndex?: number;
  testID?: string;
}

const LEFT = 52;
const BOTTOM = 24;
const TOP = 8;

// Balance over time (spec 046 FR 12): a line with a light area, the projected part dashed, a crosshair on the selected point.
function LineChart(props: LineChartProps) {
  const { colors, typography } = useKitTheme();
  const [width, setWidth] = useState(320);
  const height = props.height ?? 220;
  const { points } = props;
  const plotWidth = Math.max(width - LEFT - 8, 1);
  const plotHeight = height - TOP - BOTTOM;
  const values = points.map((point) => point.value);
  const ticks = niceTicks(Math.min(0, ...values, 0), Math.max(0, ...values, 0));
  const domain = { max: ticks[ticks.length - 1], min: ticks[0] };
  const xs = points.map((_, index) =>
    points.length <= 1
      ? LEFT + plotWidth / 2
      : LEFT + (index / (points.length - 1)) * plotWidth,
  );
  const coords = points.map((point, index) => ({
    x: xs[index],
    y: scaleY(point.value, domain, plotHeight, TOP),
  }));
  const firstProjected = points.findIndex((point) => point.projected);
  const realizedEnd = firstProjected === -1 ? points.length : firstProjected;
  const realized = coords.slice(0, realizedEnd);
  // The dashed part starts at the last realized point so the line is continuous.
  const projected = coords.slice(Math.max(realizedEnd - 1, 0));
  const baseline = scaleY(0, domain, plotHeight, TOP);
  const step = Math.max(1, Math.ceil(points.length / (props.maxLabels ?? 6)));
  const selected = props.selectedIndex;
  const styles = StyleSheet.create({
    overlay: {
      bottom: BOTTOM,
      flexDirection: "row",
      left: LEFT,
      position: "absolute",
      right: 8,
      top: TOP,
    },
    root: { height },
    slot: { flex: 1 },
  });
  const fontFamily = typography.caption.fontFamily;

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessible
      onLayout={onLayout}
      style={styles.root}
      testID={props.testID}
    >
      <Svg height={height} width={width}>
        {ticks.map((tick) => {
          const y = scaleY(tick, domain, plotHeight, TOP);

          return (
            <G key={tick}>
              <Line
                stroke={colors.surfaceRaised}
                strokeWidth={1}
                x1={LEFT}
                x2={width - 8}
                y1={y}
                y2={y}
              />
              <SvgText
                fill={colors.textSecondary}
                fontFamily={fontFamily}
                fontSize={11}
                textAnchor="end"
                x={LEFT - 6}
                y={y + 4}
              >
                {props.formatTick(tick)}
              </SvgText>
            </G>
          );
        })}
        {realized.length > 1 ? (
          <Path
            d={`${toPath(realized)} L${realized[realized.length - 1].x} ${baseline} L${realized[0].x} ${baseline} Z`}
            fill={colors.accent}
            fillOpacity={0.08}
          />
        ) : null}
        <Path
          d={toPath(realized)}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
        />
        {projected.length > 1 && firstProjected !== -1 ? (
          <Path
            d={toPath(projected)}
            fill="none"
            stroke={colors.accent}
            strokeDasharray="5 4"
            strokeWidth={2}
          />
        ) : null}
        {points.map((point, index) =>
          index % step === 0 || index === points.length - 1 ? (
            <SvgText
              fill={colors.textSecondary}
              fontFamily={fontFamily}
              fontSize={11}
              key={`${point.label}-${index}`}
              textAnchor="middle"
              x={xs[index]}
              y={height - 6}
            >
              {point.label}
            </SvgText>
          ) : null,
        )}
        {selected !== undefined && coords[selected] ? (
          <>
            <Line
              stroke={colors.border}
              strokeWidth={1}
              x1={coords[selected].x}
              x2={coords[selected].x}
              y1={TOP}
              y2={TOP + plotHeight}
            />
            <Circle
              cx={coords[selected].x}
              cy={coords[selected].y}
              fill={colors.surface}
              r={5}
              stroke={colors.accent}
              strokeWidth={2}
            />
          </>
        ) : null}
      </Svg>
      <View style={styles.overlay}>
        {points.map((point, index) => (
          <Pressable
            accessibilityLabel={`${point.accessibilityLabel ?? point.label}, ${props.formatValue(point.value)}`}
            accessibilityRole="button"
            key={`${point.label}-${index}`}
            onHoverIn={() => props.onSelect?.(index)}
            onPress={() => props.onSelect?.(index)}
            style={styles.slot}
            testID={props.testID && `${props.testID}-point-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

export default LineChart;
