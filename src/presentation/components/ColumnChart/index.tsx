import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

import { niceTicks, scaleY } from "@components/LineChart/chartScale";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ColumnAmounts {
  projected: number;
  realized: number;
}

export interface ColumnChartProps {
  accessibilityLabel: string;
  formatTick: (value: number) => string;
  formatValue: (value: number) => string;
  groups: ColumnGroup[];
  height?: number;
  maxLabels?: number;
  onSelect?: (index: number) => void;
  selectedIndex?: number;
  testID?: string;
}

export interface ColumnGroup {
  expense: ColumnAmounts;
  income: ColumnAmounts;
  label: string;
}

const LEFT = 52;
const BOTTOM = 24;
const TOP = 8;

// Income × expenses per bucket (spec 046 FR 13): two columns per group on one axis from zero; the projected part is lighter.
function ColumnChart(props: ColumnChartProps) {
  const { colors, typography } = useKitTheme();
  const [width, setWidth] = useState(320);
  const height = props.height ?? 220;
  const plotWidth = Math.max(width - LEFT - 8, 1);
  const plotHeight = height - TOP - BOTTOM;
  const max = Math.max(
    0,
    ...props.groups.flatMap((group) => [
      total(group.income),
      total(group.expense),
    ]),
  );
  const ticks = niceTicks(0, max);
  const domain = { max: ticks[ticks.length - 1], min: 0 };
  const slot = plotWidth / Math.max(props.groups.length, 1);
  const barWidth = Math.max(Math.min(slot / 2 - 3, 18), 2);
  const step = Math.max(
    1,
    Math.ceil(props.groups.length / (props.maxLabels ?? 6)),
  );
  const base = scaleY(0, domain, plotHeight, TOP);
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

  // Realized part from the axis, projected part stacked on top at half opacity.
  function column(
    amounts: ColumnAmounts,
    x: number,
    color: string,
    key: string,
  ) {
    const realizedY = scaleY(amounts.realized, domain, plotHeight, TOP);
    const topY = scaleY(total(amounts), domain, plotHeight, TOP);

    return (
      <G key={key}>
        <Rect
          fill={color}
          height={Math.max(base - realizedY, 0)}
          rx={3}
          width={barWidth}
          x={x}
          y={realizedY}
        />
        {amounts.projected > 0 ? (
          <Rect
            fill={color}
            fillOpacity={0.5}
            height={Math.max(realizedY - topY, 0)}
            rx={3}
            width={barWidth}
            x={x}
            y={topY}
          />
        ) : null}
      </G>
    );
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
        {props.groups.map((group, index) => {
          const center = LEFT + slot * index + slot / 2;

          return (
            <G key={`${group.label}-${index}`}>
              {props.selectedIndex === index ? (
                <Rect
                  fill={colors.surfaceRaised}
                  height={plotHeight}
                  width={slot}
                  x={LEFT + slot * index}
                  y={TOP}
                />
              ) : null}
              {column(
                group.income,
                center - barWidth - 1,
                colors.income,
                "income",
              )}
              {column(group.expense, center + 1, colors.expense, "expense")}
              {index % step === 0 ? (
                <SvgText
                  fill={colors.textSecondary}
                  fontFamily={fontFamily}
                  fontSize={11}
                  textAnchor="middle"
                  x={center}
                  y={height - 6}
                >
                  {group.label}
                </SvgText>
              ) : null}
            </G>
          );
        })}
      </Svg>
      <View style={styles.overlay}>
        {props.groups.map((group, index) => (
          <Pressable
            accessibilityLabel={`${group.label}, ${props.formatValue(total(group.income))}, ${props.formatValue(total(group.expense))}`}
            accessibilityRole="button"
            key={`${group.label}-${index}`}
            onHoverIn={() => props.onSelect?.(index)}
            onPress={() => props.onSelect?.(index)}
            style={styles.slot}
            testID={props.testID && `${props.testID}-group-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

function total(amounts: ColumnAmounts): number {
  return amounts.realized + amounts.projected;
}

export default ColumnChart;
