import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

export interface BarListColumns {
  average: string;
  category: string;
  percent: string;
  total: string;
}

export interface BarListProps {
  /** Wide layout: a header and the average as a column (spec 052); without it the average is a second line */
  columns?: BarListColumns;
  /** Only label, amount and share (with the dot): the bars would repeat what a pie already shows */
  hideBars?: boolean;
  /** The pressable rows open this; without it the list is read-only */
  onPress?: (id: string) => void;
  /** Used for the accessibility label of a pressable row */
  openLabel?: string;
  rows: BarListRow[];
  testID?: string;
  tone: "expense" | "income";
}

export interface BarListRow {
  /** Average per month, already formatted; never ellipsized (spec 052) */
  average?: string;
  /** A dot before the label that ties the row to a slice of a pie */
  dotColor?: string;
  id: string;
  label: string;
  /** The rows that cannot be opened ("Other", "No tag") */
  muted?: boolean;
  percent: string;
  /** `0..1`: the bar length against the longest row */
  ratio: number;
  /** Shown after the label, for example "Archived" */
  suffix?: string;
  value: string;
}

// Ranked horizontal bars (spec 046 FR 14/15): label, amount and share; a row can open its details.
function BarList(props: BarListProps) {
  const { colors, radius, spacing } = useKitTheme();
  const { testID } = props;
  const barHeight = isWeb() ? 12 : 8;
  const styles = StyleSheet.create({
    average: { minWidth: 104 },
    bar: {
      backgroundColor: props.tone === "income" ? colors.income : colors.expense,
      borderRadius: radius.sm / 2.5,
      height: barHeight,
    },
    dot: { borderRadius: 5, height: 10, width: 10 },
    header: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.xs,
      paddingBottom: spacing.xxs,
    },
    numbers: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    percent: { minWidth: 44 },
    row: { gap: spacing.xxs, minHeight: 44, paddingVertical: spacing.xxs },
    text: { flex: 1 },
    top: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    total: { minWidth: 104 },
    track: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.sm / 2.5,
      height: barHeight,
      overflow: "hidden",
    },
  });

  return (
    <View testID={testID}>
      {props.columns ? (
        <View style={styles.header}>
          <View style={styles.text}>
            <Text.Overline tone="secondary" value={props.columns.category} />
          </View>
          <View style={styles.total}>
            <Text.Overline
              align="right"
              tone="secondary"
              value={props.columns.total}
            />
          </View>
          <View style={styles.percent}>
            <Text.Overline
              align="right"
              tone="secondary"
              value={props.columns.percent}
            />
          </View>
          <View style={styles.average}>
            <Text.Overline
              align="right"
              tone="secondary"
              value={props.columns.average}
            />
          </View>
        </View>
      ) : null}
      {props.rows.map((row) => {
        const content = (
          <View style={styles.row}>
            <View style={styles.top}>
              {row.dotColor ? (
                <View style={[styles.dot, { backgroundColor: row.dotColor }]} />
              ) : null}
              <Text.Body
                numberOfLines={1}
                tone={row.muted ? "secondary" : "primary"}
                value={row.suffix ? `${row.label} · ${row.suffix}` : row.label}
              />
              <View style={styles.text} />
              {props.columns ? (
                <View style={styles.numbers}>
                  <View style={styles.total}>
                    <Text.BodyStrong align="right" tabular value={row.value} />
                  </View>
                  <View style={styles.percent}>
                    <Text.Caption
                      align="right"
                      tabular
                      tone="secondary"
                      value={row.percent}
                    />
                  </View>
                  <View style={styles.average}>
                    {row.average ? (
                      <Text.Body
                        align="right"
                        tabular
                        testID={testID && `${testID}-row-${row.id}-average`}
                        tone="secondary"
                        value={row.average}
                      />
                    ) : null}
                  </View>
                </View>
              ) : (
                <View style={styles.numbers}>
                  <Text.BodyStrong tabular value={row.value} />
                  <Text.Caption tabular tone="secondary" value={row.percent} />
                </View>
              )}
            </View>
            {row.average && !props.columns ? (
              <Text.Caption
                testID={testID && `${testID}-row-${row.id}-average`}
                tone="secondary"
                value={row.average}
              />
            ) : null}
            {props.hideBars ? null : (
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    { width: `${Math.max(0, Math.min(1, row.ratio)) * 100}%` },
                  ]}
                />
              </View>
            )}
          </View>
        );

        if (!props.onPress || row.muted) {
          return (
            <View
              accessibilityLabel={labelOf(row)}
              accessible
              key={row.id}
              testID={testID && `${testID}-row-${row.id}`}
            >
              {content}
            </View>
          );
        }

        return (
          <Touchable
            accessibilityHint={props.openLabel}
            accessibilityLabel={labelOf(row)}
            accessibilityRole="button"
            key={row.id}
            onPress={() => props.onPress?.(row.id)}
            testID={testID && `${testID}-row-${row.id}`}
          >
            {content}
          </Touchable>
        );
      })}
    </View>
  );
}

function labelOf(row: BarListRow): string {
  const base = `${row.label}, ${row.value}, ${row.percent}`;

  return row.average ? `${base}, ${row.average}` : base;
}

export default BarList;
