import { StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import BarList, { BarListColumns, BarListRow } from "@components/BarList";
import { useKitTheme } from "@components/utils/useKitTheme";
import { chartPalette } from "@presentation/theme/constants/chartPalette";

export interface PieBreakdownProps {
  /** Wide layout: the legend as a table with these headers (spec 052) */
  columns?: BarListColumns;
  onPress?: (id: string) => void;
  openLabel?: string;
  /** The rows (largest first); each slice is as big as its `ratio`. A `muted` row is grey and not pressable */
  rows: BarListRow[];
  size?: number;
  testID?: string;
}

const FULL_TURN = Math.PI * 2;

// A pie with its rows beside it (spec 046): the same ranked rows as a `BarList`, each with the colour of its slice.
function PieBreakdown(props: PieBreakdownProps) {
  const { colors, spacing } = useKitTheme();
  const size = props.size ?? 168;
  const radius = size / 2;
  const total = props.rows.reduce(
    (sum, row) => sum + Math.max(row.ratio, 0),
    0,
  );
  const colored = props.rows.map((row, index) => ({
    ...row,
    dotColor: row.muted
      ? colors.textSecondary
      : chartPalette[index % chartPalette.length],
  }));
  const styles = StyleSheet.create({
    list: {
      flexBasis: props.columns ? 420 : 240,
      flexGrow: 1,
      flexShrink: 1,
    },
    pie: { alignSelf: "center" },
    root: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
  });
  let angle = 0;

  return (
    <View style={styles.root}>
      <View accessibilityElementsHidden style={styles.pie}>
        <Svg height={size} width={size}>
          {total === 0 ? (
            <Circle
              cx={radius}
              cy={radius}
              fill={colors.surfaceRaised}
              r={radius}
            />
          ) : (
            colored.map((row) => {
              const sweep = (Math.max(row.ratio, 0) / total) * FULL_TURN;
              const from = angle;

              angle += sweep;

              if (sweep <= 0) {
                return null;
              }

              const pressable = !!props.onPress && !row.muted;

              return (
                <G key={row.id}>
                  {sweep >= FULL_TURN - 0.0001 ? (
                    <Circle
                      cx={radius}
                      cy={radius}
                      fill={row.dotColor}
                      onPress={
                        pressable ? () => props.onPress?.(row.id) : undefined
                      }
                      r={radius}
                    />
                  ) : (
                    <Path
                      d={slicePath(radius, radius, from, from + sweep)}
                      fill={row.dotColor}
                      onPress={
                        pressable ? () => props.onPress?.(row.id) : undefined
                      }
                      stroke={colors.surface}
                      strokeWidth={1.5}
                    />
                  )}
                </G>
              );
            })
          )}
        </Svg>
      </View>
      <View style={styles.list}>
        <BarList
          columns={props.columns}
          hideBars
          onPress={props.onPress}
          openLabel={props.openLabel}
          rows={colored}
          testID={props.testID}
          tone="expense"
        />
      </View>
    </View>
  );
}

// `M cx cy L start A r r 0 large 1 end Z`, clockwise from the top.
function pointAt(center: number, radius: number, angle: number): string {
  return `${center + radius * Math.sin(angle)} ${center - radius * Math.cos(angle)}`;
}

function slicePath(
  center: number,
  radius: number,
  from: number,
  to: number,
): string {
  return `M${center} ${center} L${pointAt(center, radius, from)} A${radius} ${radius} 0 ${to - from > Math.PI ? 1 : 0} 1 ${pointAt(center, radius, to)} Z`;
}

export default PieBreakdown;
