import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface WeekBar {
  /** A week at zero: grey, out of the average */
  excluded: boolean;
  key: string;
  /** `0..1` against the biggest week */
  ratio: number;
  /** `0..1`: recent weeks are darker */
  weight: number;
}

export interface WeekBarsProps {
  /** Gives a screen reader the same figures as the bars */
  accessibilityLabel: string;
  bars: WeekBar[];
  testID?: string;
}

const HEIGHT = 80;
const MIN_BAR = 4;

// The consumption of the last weeks as plain bars (spec 123 FR 19).
function WeekBars(props: WeekBarsProps) {
  const { colors, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4, flex: 1 },
    root: {
      alignItems: "flex-end",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: spacing.xs,
      height: HEIGHT + spacing.xxs,
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessible
      role="img"
      style={styles.root}
      testID={props.testID}
    >
      {props.bars.map((bar) => (
        <View
          key={bar.key}
          style={[
            styles.bar,
            {
              backgroundColor: bar.excluded ? colors.border : colors.accent,
              height: Math.max(MIN_BAR, Math.round(bar.ratio * HEIGHT)),
              opacity: bar.excluded ? 1 : bar.weight,
            },
          ]}
          testID={props.testID && `${props.testID}-${bar.key}`}
        />
      ))}
    </View>
  );
}

export default WeekBars;
