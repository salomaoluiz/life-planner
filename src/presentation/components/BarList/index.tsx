import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

export interface BarListProps {
  /** The pressable rows open this; without it the list is read-only */
  onPress?: (id: string) => void;
  /** Used for the accessibility label of a pressable row */
  openLabel?: string;
  rows: BarListRow[];
  testID?: string;
  tone: "expense" | "income";
}

export interface BarListRow {
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
    bar: {
      backgroundColor: props.tone === "income" ? colors.income : colors.expense,
      borderRadius: radius.sm / 2.5,
      height: barHeight,
    },
    numbers: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    row: { gap: spacing.xxs, minHeight: 44, paddingVertical: spacing.xxs },
    text: { flex: 1 },
    top: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    track: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.sm / 2.5,
      height: barHeight,
      overflow: "hidden",
    },
  });

  return (
    <View testID={testID}>
      {props.rows.map((row) => {
        const content = (
          <View style={styles.row}>
            <View style={styles.top}>
              <Text.Body
                numberOfLines={1}
                tone={row.muted ? "secondary" : "primary"}
                value={row.suffix ? `${row.label} · ${row.suffix}` : row.label}
              />
              <View style={styles.text} />
              <View style={styles.numbers}>
                <Text.BodyStrong tabular value={row.value} />
                <Text.Caption tabular tone="secondary" value={row.percent} />
              </View>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  { width: `${Math.max(0, Math.min(1, row.ratio)) * 100}%` },
                ]}
              />
            </View>
          </View>
        );

        if (!props.onPress || row.muted) {
          return (
            <View
              accessibilityLabel={`${row.label}, ${row.value}, ${row.percent}`}
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
            accessibilityLabel={`${row.label}, ${row.value}, ${row.percent}`}
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

export default BarList;
