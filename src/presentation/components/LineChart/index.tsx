import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";

import { useKitTheme } from "@components/utils/useKitTheme";

import { axisWidth, buildSegments, niceTicks, scaleY } from "./chartScale";
import TodayMarker from "./TodayMarker";

export interface LineChartPoint {
  /** Read by screen readers instead of the axis label (which may be empty for repeated labels) */
  accessibilityLabel?: string;
  label: string;
  projected: boolean;
  /** `undefined` = no value at this point (spec 094): the line leaves a gap */
  value: number | undefined;
}

export interface LineChartProps {
  accessibilityLabel: string;
  formatTick: (value: number) => string;
  formatValue: (value: number) => string;
  height?: number;
  /** Labels are skipped to keep this many at most */
  maxLabels?: number;
  onSelect?: (index: number) => void;
  /** One series. Ignored WHEN `series` is given */
  points?: LineChartPoint[];
  selectedIndex?: number;
  /** Several series, drawn in order (spec 094) */
  series?: LineChartSeries[];
  testID?: string;
  /** Draws the "Today" line at this point (spec 053 FR 18) */
  today?: { index: number; label: string };
}

/** One line; every series has the same number of points, at the same x positions (spec 094) */
export interface LineChartSeries {
  /** `primary` = thick line on top, `muted` = thin and faded line behind it */
  emphasis: "muted" | "primary";
  points: LineChartPoint[];
}

const MIN_LEFT = 52;
const TICK_FONT = 11;
const BOTTOM = 24;
const TOP = 8;
const PRIMARY_WIDTH = 3.5;
const MUTED_WIDTH = 2;
const MUTED_OPACITY = 0.35;
const SINGLE_WIDTH = 2;

// Balance over time (spec 046 FR 12): a line that is green above zero and red below it, the projected part dashed, a crosshair on the selected point.
function LineChart(props: LineChartProps) {
  const { colors, typography } = useKitTheme();
  const [width, setWidth] = useState(320);
  const height = props.height ?? 220;
  const plotHeight = height - TOP - BOTTOM;
  const seriesList: LineChartSeries[] = props.series ?? [
    { emphasis: "primary", points: props.points ?? [] },
  ];
  const multi = seriesList.length > 1;
  // The x positions, the axis labels and the slots follow the first series; every series has the same length.
  const points = seriesList[0]?.points ?? [];
  const values = seriesList.flatMap((item) =>
    item.points.flatMap((point) =>
      point.value === undefined ? [] : [point.value],
    ),
  );
  const ticks = niceTicks(Math.min(0, ...values, 0), Math.max(0, ...values, 0));
  const left = axisWidth(ticks.map(props.formatTick), TICK_FONT, MIN_LEFT);
  const plotWidth = Math.max(width - left - 8, 1);
  const domain = { max: ticks[ticks.length - 1], min: ticks[0] };
  const xs = points.map((_, index) =>
    points.length <= 1
      ? left + plotWidth / 2
      : left + (index / (points.length - 1)) * plotWidth,
  );
  const baseline = scaleY(0, domain, plotHeight, TOP);
  const drawn = seriesList.map((item) => {
    const coords = item.points.map((point, index) =>
      point.value === undefined
        ? undefined
        : { x: xs[index], y: scaleY(point.value, domain, plotHeight, TOP) },
    );

    return {
      coords,
      emphasis: item.emphasis,
      points: item.points,
      segments: buildSegments(
        coords,
        item.points,
        baseline,
        colors.income,
        colors.expense,
      ),
    };
  });
  const step = Math.max(1, Math.ceil(points.length / (props.maxLabels ?? 6)));
  const selected = props.selectedIndex;
  const styles = StyleSheet.create({
    overlay: {
      bottom: BOTTOM,
      flexDirection: "row",
      left,
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
                x1={left}
                x2={width - 8}
                y1={y}
                y2={y}
              />
              <SvgText
                fill={colors.textSecondary}
                fontFamily={fontFamily}
                fontSize={TICK_FONT}
                textAnchor="end"
                x={left - 6}
                y={y + 4}
              >
                {props.formatTick(tick)}
              </SvgText>
            </G>
          );
        })}
        {drawn.map((item, seriesIndex) => (
          <G
            key={seriesIndex}
            opacity={item.emphasis === "muted" ? MUTED_OPACITY : 1}
            testID={props.testID && `${props.testID}-series-${seriesIndex}`}
          >
            {item.segments.map((segment, index) => (
              <G key={index}>
                {segment.dashed || multi ? null : (
                  <Path
                    d={`M${segment.x1} ${segment.y1} L${segment.x2} ${segment.y2} L${segment.x2} ${baseline} L${segment.x1} ${baseline} Z`}
                    fill={segment.color}
                    fillOpacity={0.08}
                  />
                )}
                <Path
                  d={`M${segment.x1} ${segment.y1} L${segment.x2} ${segment.y2}`}
                  fill="none"
                  stroke={segment.color}
                  strokeDasharray={segment.dashed ? "5 4" : undefined}
                  strokeLinecap="round"
                  strokeOpacity={item.emphasis === "muted" ? MUTED_OPACITY : 1}
                  strokeWidth={strokeWidth(item.emphasis, multi)}
                />
              </G>
            ))}
          </G>
        ))}
        {points.map((point, index) =>
          index % step === 0 || index === points.length - 1 ? (
            <SvgText
              fill={colors.textSecondary}
              fontFamily={fontFamily}
              fontSize={TICK_FONT}
              key={`${point.label}-${index}`}
              textAnchor="middle"
              x={xs[index]}
              y={height - 6}
            >
              {point.label}
            </SvgText>
          ) : null,
        )}
        {selected !== undefined && xs[selected] !== undefined ? (
          <>
            <Line
              stroke={colors.border}
              strokeWidth={1}
              x1={xs[selected]}
              x2={xs[selected]}
              y1={TOP}
              y2={TOP + plotHeight}
            />
            {drawn.map((item, seriesIndex) => {
              const coord = item.coords[selected];
              const value = item.points[selected]?.value;

              return coord && value !== undefined ? (
                <Circle
                  cx={coord.x}
                  cy={coord.y}
                  fill={colors.surface}
                  key={seriesIndex}
                  r={item.emphasis === "muted" ? 4 : 5}
                  stroke={value < 0 ? colors.expense : colors.income}
                  strokeWidth={2}
                />
              ) : null;
            })}
          </>
        ) : null}
      </Svg>
      {props.today && xs[props.today.index] !== undefined ? (
        <TodayMarker
          bottom={BOTTOM}
          label={props.today.label}
          testID={props.testID && `${props.testID}-today`}
          top={TOP}
          x={xs[props.today.index]}
        />
      ) : null}
      <View style={styles.overlay}>
        {points.map((point, index) => (
          <Pressable
            accessibilityLabel={`${point.accessibilityLabel ?? point.label}, ${props.formatValue(slotValue(seriesList, index))}`}
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

// The value a slot reads out: the first series that has one at this point (spec 094).
function slotValue(seriesList: LineChartSeries[], index: number): number {
  for (const item of seriesList) {
    const value = item.points[index]?.value;

    if (value !== undefined) {
      return value;
    }
  }

  return 0;
}

function strokeWidth(emphasis: LineChartSeries["emphasis"], multi: boolean) {
  if (!multi) {
    return SINGLE_WIDTH;
  }

  return emphasis === "primary" ? PRIMARY_WIDTH : MUTED_WIDTH;
}

export default LineChart;
