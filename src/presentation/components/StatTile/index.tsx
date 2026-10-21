import { StyleSheet, View } from "react-native";

import Skeleton from "@components/Skeleton";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface StatTileProps {
  /** The change against the previous period; `neutral` has no colour */
  delta?: { text: string; tone: "bad" | "good" | "neutral" };
  label: string;
  loading?: boolean;
  testID?: string;
  value: string;
}

const DELTA_TONE = {
  bad: "expense",
  good: "income",
  neutral: "secondary",
} as const;

// A summary figure with its change against the previous period (spec 046).
function StatTile(props: StatTileProps) {
  const { colors, radius, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    root: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      flex: 1,
      gap: spacing.xxs,
      minHeight: 88,
      padding: spacing.sm,
    },
  });

  if (props.loading) {
    return (
      <View style={styles.root} testID={testID && `${testID}-loading`}>
        <Skeleton.Box height={64} width="100%" />
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={`${props.label}: ${props.value}${props.delta ? `, ${props.delta.text}` : ""}`}
      accessible
      style={styles.root}
      testID={testID}
    >
      <Text.Caption
        numberOfLines={1}
        testID={testID && `${testID}-label`}
        tone="secondary"
        value={props.label}
      />
      <Text.Title
        numberOfLines={1}
        tabular
        testID={testID && `${testID}-value`}
        value={props.value}
      />
      {props.delta ? (
        <Text.Caption
          numberOfLines={1}
          tabular
          testID={testID && `${testID}-delta`}
          tone={DELTA_TONE[props.delta.tone]}
          value={props.delta.text}
        />
      ) : null}
    </View>
  );
}

export default StatTile;
