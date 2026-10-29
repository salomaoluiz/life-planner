import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

import Skeleton from "@components/Skeleton";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import { useKitTheme } from "@components/utils/useKitTheme";

import fitValue from "./fitValue";

export interface StatTileProps {
  /** The value in the compact format ("R$ 312 mil"), the last resort when the full one does not fit */
  compactValue?: string;
  delta?: { note?: string; text: string; tone: "bad" | "good" | "neutral" };
  /** The change against the previous period; `neutral` has no colour */
  /** A second line under the value, in the accent colour (the projected end balance, spec 053) */
  extra?: { testID?: string; text: string };
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
  const { colors, radius, spacing, typography } = useKitTheme();
  const { testID } = props;
  const [valueWidth, setValueWidth] = useState<number>();
  const fitted = fitValue({
    compact: props.compactValue,
    full: props.value,
    sizes: {
      full: typography.title.fontSize,
      small: typography.bodyStrong.fontSize,
    },
    width: valueWidth,
  });
  const styles = StyleSheet.create({
    delta: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xxs,
    },
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
      accessibilityLabel={`${props.label}: ${props.value}${props.extra ? `, ${props.extra.text}` : ""}${props.delta ? `, ${props.delta.text}${props.delta.note ? ` ${props.delta.note}` : ""}` : ""}`}
      accessible
      nativeID={testID}
      style={styles.root}
      testID={testID}
    >
      <Text.Caption
        numberOfLines={1}
        testID={testID && `${testID}-label`}
        tone="secondary"
        value={props.label}
      />
      <Tooltip content={<Text.Caption value={props.value} />}>
        <View
          onLayout={(event: LayoutChangeEvent) =>
            setValueWidth(event.nativeEvent.layout.width)
          }
          testID={testID && `${testID}-value-area`}
        >
          {fitted.fit === "small" ? (
            <Text.BodyStrong
              tabular
              testID={testID && `${testID}-value`}
              value={fitted.text}
            />
          ) : (
            <Text.Title
              tabular
              testID={testID && `${testID}-value`}
              value={fitted.text}
            />
          )}
        </View>
      </Tooltip>
      {props.extra ? (
        <Text.Caption
          numberOfLines={2}
          tabular
          testID={props.extra.testID}
          tone="accent"
          value={props.extra.text}
        />
      ) : null}
      {props.delta ? (
        <View style={styles.delta}>
          <Text.Caption
            numberOfLines={2}
            tabular
            testID={testID && `${testID}-delta`}
            tone={DELTA_TONE[props.delta.tone]}
            value={props.delta.text}
          />
          {props.delta.note ? (
            <Text.Caption
              numberOfLines={2}
              tone="secondary"
              value={props.delta.note}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default StatTile;
